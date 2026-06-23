# RideApp Local Kubernetes Deployment Script
# Voraussetzungen: Docker Desktop mit Kubernetes aktiviert

Write-Host "=== RideApp Kubernetes Deployment ===" -ForegroundColor Cyan

Write-Host "`n[1/4] Docker Image bauen..." -ForegroundColor Yellow
docker build -t rideapp:latest .
if ($LASTEXITCODE -ne 0) { Write-Host "Docker Build fehlgeschlagen!" -ForegroundColor Red; exit 1 }

Write-Host "`n[2/4] Namespace erstellen..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

Write-Host "`n[3/4] Kubernetes Ressourcen deployen..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

Write-Host "`n[4/4] Warte auf Pods..." -ForegroundColor Yellow
kubectl rollout status deployment/rideapp -n rideapp --timeout=120s

Write-Host "`n=== Deployment abgeschlossen! ===" -ForegroundColor Green
Write-Host "App erreichbar unter: http://localhost:30000" -ForegroundColor Cyan
Write-Host "`nPod Status:" -ForegroundColor Yellow
kubectl get pods -n rideapp
