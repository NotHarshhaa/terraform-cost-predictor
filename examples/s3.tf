resource "aws_s3_bucket" "assets" {
  bucket = "my-app-assets-bucket"

  tags = {
    Name = "assets-bucket"
  }
}

resource "aws_s3_bucket" "logs" {
  bucket = "my-app-logs-bucket"

  tags = {
    Name = "logs-bucket"
  }
}
