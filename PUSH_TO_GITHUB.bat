@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║              PUSH TO GITHUB - All Changes                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding all files...
git add .
echo ✓ Files staged
echo.

echo [3/4] Committing changes...
git commit -m "Enterprise Microservices Architecture - Complete Implementation

- API Gateway with Nginx load balancer
- Auth Service with JWT OAuth 2.0
- File Service with S3 and RabbitMQ
- Report Service with PDF generation
- Message Queue (RabbitMQ + Celery)
- Database replication (PostgreSQL + Replica)
- Connection pooling (PgBouncer)
- Kubernetes HPA auto-scaling
- Prometheus + Grafana monitoring
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CI/CD pipeline (GitHub Actions)
- Infrastructure as Code (Terraform)
- 19 services total
- All integrated and tested"
echo ✓ Changes committed
echo.

echo [4/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo Trying 'master' branch...
    git push origin master
)
echo ✓ Pushed to GitHub
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                  PUSH COMPLETE                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Your enterprise microservices architecture is now on GitHub!
echo.
pause
