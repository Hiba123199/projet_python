from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
import logging

# Configuration du logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@csrf_exempt
def direct_register(request):
    """
    Vue simplifiée pour inscription - accepte à la fois les requêtes form et json
    """
    logger.info("=== NOUVELLE TENTATIVE D'INSCRIPTION ===")
    logger.info(f"Méthode: {request.method}")
    logger.info(f"Content-Type: {request.content_type}")
    
    # Gérer les requêtes OPTIONS pour CORS
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response
    
    # Gérer les requêtes GET pour tester
    if request.method == 'GET':
        return render(request, 'register.html')  # Utilise le template existant pour le formulaire
    
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
        
        # Récupération des champs
        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')
        password2 = data.get('password2', '')
        
        logger.info(f"Champs extraits: username={username}, email={email}, a_password={'oui' if password else 'non'}, a_password2={'oui' if password2 else 'non'}")
        
        # Validation des données
        errors = {}
        
        if not username:
            errors['username'] = "Le nom d'utilisateur est requis"
        elif User.objects.filter(username=username).exists():
            errors['username'] = "Ce nom d'utilisateur est déjà pris"
            
        if not email:
            errors['email'] = "L'email est requis"
        elif User.objects.filter(email=email).exists():
            errors['email'] = "Cet email est déjà utilisé"
            
        if not password:
            errors['password'] = "Le mot de passe est requis"
        elif len(password) < 8:
            errors['password'] = "Le mot de passe doit contenir au moins 8 caractères"
            
        if password != password2:
            errors['password2'] = "Les mots de passe ne correspondent pas"
        
        # Si validation échoue, renvoyer les erreurs
        if errors:
            logger.warning(f"Erreurs de validation: {errors}")
            response = JsonResponse(errors, status=400)
            # Ajouter les en-têtes CORS
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        # Créer l'utilisateur
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            logger.info(f"Utilisateur {username} créé avec succès!")
            
            # Réponse réussie
            response = JsonResponse({
                'success': True,
                'message': 'Inscription réussie',
                'username': username
            })
            response["Access-Control-Allow-Origin"] = "*"
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'utilisateur: {str(e)}")
            response = JsonResponse({'error': str(e)}, status=500)
            response["Access-Control-Allow-Origin"] = "*"
            return response
    
    # Si la méthode n'est pas supportée
    return JsonResponse({'error': 'Méthode non supportée'}, status=405)
