packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

locals {
  image_desc   = "Web application image"
  current_time = regex_replace(timestamp(), "[- TZ:]", "")
}

variable "region" {
  default = "ca-central-1"
}

variable "ubuntu_ami_id" {
  description = "AMI ID for Ubuntu 24.04 LTS"
  default     = "ami-0eb9fdcf0d07bd5ef"
}

variable "instance_size" {
  default = "t2.micro"
}

variable "network_vpc_id" {
  description = "VPC ID for instance deployment"
  default     = "vpc-0279dafd1660f25b5"
}

variable "network_subnet_id" {
  description = "Subnet ID within the VPC"
  default     = "subnet-061a9331f680cc38b"
}

variable "ami_identifier" {
  default = "myWebAppAMI"
}

variable "DEV_ACCOUNTID" {
  default = "202533509492"
}

variable "DEMO_ACCOUNTID" {
  default = "831926588227"
}

variable "sns_topic_arn" {
  description = "ARN of the SNS Topic for notifications"
  default     = "arn:aws:sns:ca-central-1:831926588227:UserVerificationTopic"
}

source "amazon-ebs" "ubuntu_image" {
  region                      = var.region
  source_ami                  = var.ubuntu_ami_id
  instance_type               = var.instance_size
  ssh_username                = "ubuntu"
  ami_name                    = "${var.ami_identifier}-${local.current_time}"
  ami_description             = local.image_desc
  vpc_id                      = var.network_vpc_id
  subnet_id                   = var.network_subnet_id
  ami_users                   = [var.DEV_ACCOUNTID, var.DEMO_ACCOUNTID]
  associate_public_ip_address = true

  tags = {
    Name        = "webapp-image"
    Environment = "Development"
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu_image"]

  # Create the required directory for CloudWatch Agent configuration
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc"
    ]
  }

  # Upload application files and CloudWatch config
  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
    generated   = true
  }

  provisioner "file" {
    source      = "app/packer/scripts/webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "file" {
    source      = "app/packer/amazon-cloudwatch-agent.json"
    destination = "/tmp/amazon-cloudwatch-agent.json"
  }

  # Install CloudWatch Agent, Node.js, and other dependencies
  provisioner "shell" {
    inline = [
      # Update package index
      "echo 'Updating package index...' && until sudo apt-get update -y; do echo 'Retrying apt-get update...'; sleep 5; done",

      # Install required packages with retries
      "echo 'Installing dependencies...' && until sudo apt-get install -y nodejs npm unzip; do echo 'Retrying apt-get install...'; sleep 5; done",

      # Verify installations
      "node -v",
      "npm -v",

      # Download and install Amazon CloudWatch Agent
      "wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i -E amazon-cloudwatch-agent.deb || echo 'CloudWatch Agent already installed'"
    ]
  }

  # Set up application, CloudWatch agent config, and logging permissions
  provisioner "shell" {
    inline = [
      "sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service",
      "sudo mv /tmp/amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json",
      "sudo unzip /tmp/webapp.zip -d /opt/webapp",
      "sudo useradd -r -s /usr/sbin/nologin -m csye6225 || echo 'User csye6225 already exists'",
      "sudo chown -R csye6225:csye6225 /opt/webapp",
      "sudo chmod -R 755 /opt/webapp",
      "sudo touch /var/log/webapp.log",
      "sudo chown csye6225:csye6225 /var/log/webapp.log",
      "sudo chmod 664 /var/log/webapp.log",
      "echo 'SNS_TOPIC_ARN=${var.sns_topic_arn}' | sudo tee -a /etc/environment",
      "echo 'AWS_REGION=${var.region}' | sudo tee -a /etc/environment",
      "sudo systemctl enable amazon-cloudwatch-agent.service",
      "sudo systemctl enable webapp.service"
    ]
  }

  # Reload and start services
  provisioner "shell" {
    inline = [
      "sudo systemctl daemon-reload",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s",
      "sudo systemctl start webapp.service"
    ]
  }
}