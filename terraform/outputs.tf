output "application_url" {
  value = "http://stockflow.local:8081"
}

output "port_forward_command" {
  value = "kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 8081:80"
}