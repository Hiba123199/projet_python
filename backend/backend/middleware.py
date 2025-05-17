import re

class CSRFExemptMiddleware:
    """
    Middleware pour exempter certaines routes de la vérification CSRF.
    Particulièrement utile pour les API utilisées par React.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Compiler les expressions régulières une seule fois à l'initialisation
        self.exempt_urls = [
            re.compile(r'^/accounts/api/'),
            re.compile(r'^/api/'),
        ]

    def __call__(self, request):
        # Vérifie si l'URL demandée correspond à l'une des routes exemptées
        path = request.path_info.lstrip('/')
        
        # Exemption CSRF pour les API (React en développement et production)
        if request.path.startswith('/api/') or any(m.match(path) for m in self.exempt_urls):
            setattr(request, '_dont_enforce_csrf_checks', True)
        
        response = self.get_response(request)
        
        # Ajouter des en-têtes CORS supplémentaires pour React en développement
        if request.path.startswith('/api/'):
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response

class ReactDevProxyMiddleware:
    """
    Middleware pour faciliter le développement avec React sur localhost:3000
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Ajouter les headers pour le hot reload React
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        return response
