packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}
 
variable "aws_region" {
  default = "us-east-1"
}
 
variable "source_ami" {
  description = "Ubuntu 24.04 LTS AMI ID"
  default     = "ami-0ea3c35c5c3284d82"
}
 
variable "instance_type" {
  default = "t2.micro"
}
 
variable "vpc_id" {
  description = "VPC ID where the instance should be launched"
  default     = "vpc-0a490082e6a32b205"
}
 
variable "subnet_id" {
  description = "Subnet ID in the specified VPC"
  default     = "subnet-064700dacecb238d3"
}
 
variable "ami_name" {
  default = "webappAMI"
}
 
variable "MYSQL_USER" {
  type    = string
  default = "damini"
}
 
variable "MYSQL_PASSWORD" {
  type    = string
  default = "23101996"
}
 
variable "MYSQL_DATABASE" {
  type    = string
  default = "cloudApp"
}
 
locals {
  ami_description = "Image for webapp"
  timestamp       = regex_replace(timestamp(), "[- TZ:]", "")
}
 
source "amazon-ebs" "ubuntu" {
  region          = var.aws_region
  source_ami      = var.source_ami
  instance_type   = var.instance_type
  ssh_username    = "ubuntu"
  ami_name        = "${var.ami_name}-${local.timestamp}"
  ami_description = local.ami_description
  vpc_id          = var.vpc_id
  subnet_id       = var.subnet_id
 
  tags = {
    Name        = "webapp-image"
    Environment = "Dev"
  }
}
 
build {
  sources = ["source.amazon-ebs.ubuntu"]
 
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
      "sudo mysql -e \"CREATE USER IF NOT EXISTS '${var.MYSQL_USER}' IDENTIFIED BY '${var.MYSQL_PASSWORD}';\"",
      "sudo mysql -e \"CREATE DATABASE IF NOT EXISTS ${var.MYSQL_DATABASE};\"",
      "sudo mysql -e \"GRANT ALL PRIVILEGES ON ${var.MYSQL_DATABASE}.* TO '${var.MYSQL_USER}';\"",
      "sudo apt install -y nodejs npm",
      "sudo apt install unzip -y",
      "node -v",
      "npm -v",
 
      #"sudo mv /tmp/webapp.zip /opt",
      "sudo mv /tmp/webapp.service /etc/systemd/system",
      "sudo unzip /tmp/webapp.zip -d /opt/webapp",
      "sudo mv /tmp/.env /opt/webapp",
 
      # Create and Set ownership csye6225 user with no login shell
      "sudo useradd -r -s /usr/sbin/nologin -m csye6225",
      "sudo chown -R csye6225:csye6225 /tmp/webapp.zip",
 
      # Extract webapp and set up the systemd service
      "sudo chown -R csye6225:csye6225 /opt/webapp"
    ]
  }
 
  provisioner "shell" {
    inline = [
      # Enable the service
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp.service"
    ]
  }
 
}