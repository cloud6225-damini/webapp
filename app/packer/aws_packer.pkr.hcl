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

variable "db_username" {
  type    = string
  default = "damini"
}

variable "db_password" {
  type    = string
  default = "23101996"
}

variable "db_name" {
  type    = string
  default = "cloudApp"
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
  ami_users                   = []
  associate_public_ip_address = true

  tags = {
    Name        = "webapp-image"
    Environment = "Development"
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu_image"]

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
    source      = ".env"
    destination = "/tmp/.env"
    generated   = true
  }

  provisioner "shell" {
    inline = [
      "sudo apt update",
      "sudo apt -y install mysql-server",
      "sudo systemctl enable mysql",
      "sudo systemctl start mysql",
      "sudo mysql -e \"CREATE USER IF NOT EXISTS '${var.db_username}' IDENTIFIED BY '${var.db_password}';\"",
      "sudo mysql -e \"CREATE DATABASE IF NOT EXISTS ${var.db_name};\"",
      "sudo mysql -e \"GRANT ALL PRIVILEGES ON ${var.db_name}.* TO '${var.db_username}';\"",
      "sudo apt install -y nodejs npm",
      "sudo apt install unzip -y",
      "node -v",
      "npm -v",
      "sudo mv /tmp/webapp.service /etc/systemd/system",
      "sudo unzip /tmp/webapp.zip -d /opt/webapp",
      "sudo mv /tmp/.env /opt/webapp",
      "sudo useradd -r -s /usr/sbin/nologin -m csye6225",
      "sudo chown -R csye6225:csye6225 /tmp/webapp.zip",
      "sudo chown -R csye6225:csye6225 /opt/webapp"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service"
    ]
  }
}
