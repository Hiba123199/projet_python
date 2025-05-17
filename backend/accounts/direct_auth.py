from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import logging

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@csrf_exempt
def direct_login(request):
    """
    Vue simplifiée pour la connexion - accepte à la fois les requêtes form et json
    """
    logger.info("=== NOUVELLE TENTATIVE DE CONNEXION ===")
    logger.info(f"Méthode: {request.method}")
    logger.info(f"Content-Type: {request.content_type}")
    
    # Gérer les requêtes OPTIONS pour CORS
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response
    
    # Pour les requêtes GET, renvoyer la page de connexion standard
    if request.method == 'GET':
        return JsonResponse({
            'message': "Endpoint de connexion directe prêt à recevoir des requêtes POST."
        })
    
    # Pour les requêtes POST
    if request.method == 'POST':
        # Récupérer les données (support JSON et form-data)
        if request.content_type and 'application/json' in request.content_type:
            try:
                body = request.body.decode('utf-8')
                logger.info(f"Données JSON brutes: {body}")
                data = json.loads(body)
            except Exception as e:
                logger.error(f"Erreur de parsing JSON: {str(e)}")
                return JsonResponse({'error': str(e)}, status=400)
        else:
            data = request.POST.dict()
            logger.info(f"Données de formulaire: {data}")
        
        # Récupération des identifiants
        username = data.get('username', '')
        password = data.get('password', '')
        
        logger.info(f"Tentative de connexion pour l'utilisateur: {username}")
        
        if not username or not password:
            logger.warning("Identifiants manquants")
            return JsonResponse({'error': 'Veuillez fournir un nom d\'utilisateur et un mot de passe'}, status=400)
        
        # Authentification
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Connexion réussie
            login(request, user)
            logger.info(f"Connexion réussie pour l'utilisateur: {username}")
            
            response = JsonResponse({
                'success': True,
                'message': 'Connexion réussie',
                'username': username,
                'id': user.id,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            })
            response["Access-Control-Allow-Origin"] = "*"
            return response
        else:
            # Échec de l'authentification
            logger.warning(f"Échec de la connexion pour l'utilisateur: {username}")
            
            response = JsonResponse({
                'error': 'Échec de la connexion. Veuillez vérifier vos identifiants.'
            }, status=401)
            response["Access-Control-Allow-Origin"] = "*"
            return response
    
    # Si la méthode n'est pas supportée
    return JsonResponse({'error': 'Méthode non supportée'}, status=405)


@csrf_exempt
def direct_logout(request):
    """Vue simplifiée pour la déconnexion"""
    logout(request)
    
    response = JsonResponse({
        'success': True,
        'message': 'Déconnexion réussie'
    })
    response["Access-Control-Allow-Origin"] = "*"
    return response
