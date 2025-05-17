from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json

@require_POST
@csrf_exempt
def login_api(request):
    """API endpoint pour la connexion utilisateur"""
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return JsonResponse({'detail': 'Veuillez fournir un nom d\'utilisateur et un mot de passe'}, status=400)
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        return JsonResponse({
            'success': True,
            'token': 'session-auth',  # Django utilise les sessions pour l'authentification
            'username': user.username,
            'email': user.email,
            'id': user.id,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    else:
        return JsonResponse({'detail': 'Identifiants invalides'}, status=400)

@csrf_exempt
def register_api(request):
    """API endpoint simplifié pour l'inscription utilisateur"""
    # Ajouter les headers CORS pour toutes les réponses
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
    }
    
    # Pour les requêtes OPTIONS (preflight CORS)
    if request.method == 'OPTIONS':
        return JsonResponse({}, status=200, headers=headers)
        
    # Pour les requêtes GET (test de l'endpoint)
    if request.method == 'GET':
        return JsonResponse({
            'status': 'ok',
            'message': 'Endpoint d\'inscription prêt à recevoir des données POST'
        }, headers=headers)
    
    # Extraction des données de la requête
    if request.method == 'POST':
        try:
            if 'application/json' in request.content_type:
                data = json.loads(request.body.decode('utf-8'))
            else:
                data = request.POST.dict()
        except Exception as e:
            return JsonResponse({
                'error': 'Format de données invalide',
                'detail': str(e)
            }, status=400, headers=headers)
    
    # Récupération des champs avec valeurs par défaut
    username = data.get('username', '')
    email = data.get('email', '')
    password = data.get('password', '')
    password2 = data.get('password2', '')
    
    # Validation simplifiée
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
    
    if errors:
        return JsonResponse(errors, status=400, headers=headers)
    
    try:
        # Création de l'utilisateur
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Connexion automatique de l'utilisateur
        login(request, user)
        
        # Réponse de succès
        return JsonResponse({
            'success': True,
            'message': 'Compte créé avec succès',
            'username': user.username,
            'email': user.email,
            'id': user.id
        }, headers=headers)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500, headers=headers)

@require_POST
def logout_api(request):
    """API endpoint pour la déconnexion utilisateur"""
    logout(request)
    return JsonResponse({'success': True})

@ensure_csrf_cookie
def user_api(request):
    """API endpoint pour récupérer les informations de l'utilisateur connecté"""
    if request.user.is_authenticated:
        return JsonResponse({
            'isAuthenticated': True,
            'username': request.user.username,
            'email': request.user.email,
            'id': request.user.id
        })
    else:
        return JsonResponse({'isAuthenticated': False}, status=401)
