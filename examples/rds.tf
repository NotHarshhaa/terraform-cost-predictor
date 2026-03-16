resource "aws_db_instance" "main" {
  identifier        = "main-database"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
  storage_type      = "gp2"
  multi_az          = true

  db_name  = "appdb"
  username = "admin"
  password = "changeme123"

  tags = {
    Name = "main-database"
  }
}
