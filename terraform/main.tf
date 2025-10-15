terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_eks_cluster" "chitti" {
  name     = "chitti-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }
}

resource "aws_eks_node_group" "chitti" {
  cluster_name    = aws_eks_cluster.chitti.name
  node_group_name = "chitti-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = aws_subnet.private[*].id
  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 2
  }
  instance_types = ["t3.large"]
}

resource "aws_s3_bucket" "chitti_storage" {
  bucket = "chitti-ndt-storage"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled = true
  origin {
    domain_name = aws_s3_bucket.chitti_storage.bucket_regional_domain_name
    origin_id   = "S3-chitti-ndt"
  }
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-chitti-ndt"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_rds_cluster" "postgres" {
  cluster_identifier      = "chitti-postgres"
  engine                  = "aurora-postgresql"
  engine_version          = "15.3"
  database_name           = "chitti_ndt"
  master_username         = "postgres"
  master_password         = var.db_password
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
}

resource "aws_rds_cluster_instance" "postgres_instances" {
  count              = 2
  identifier         = "chitti-postgres-${count.index}"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class     = "db.r6g.large"
  engine             = aws_rds_cluster.postgres.engine
  engine_version     = aws_rds_cluster.postgres.engine_version
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "chitti-redis"
  engine               = "redis"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

resource "aws_mq_broker" "rabbitmq" {
  broker_name        = "chitti-rabbitmq"
  engine_type        = "RabbitMQ"
  engine_version     = "3.11.20"
  host_instance_type = "mq.t3.micro"
  deployment_mode    = "CLUSTER_MULTI_AZ"
  user {
    username = "admin"
    password = var.rabbitmq_password
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "db_password" {
  sensitive = true
}

variable "rabbitmq_password" {
  sensitive = true
}
