resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  count         = 3

  root_block_device {
    volume_size = 30
    volume_type = "gp2"
  }

  tags = {
    Name = "web-server"
  }
}

resource "aws_instance" "api" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "m5.large"
  count         = 2

  root_block_device {
    volume_size = 50
    volume_type = "gp3"
  }

  tags = {
    Name = "api-server"
  }
}
