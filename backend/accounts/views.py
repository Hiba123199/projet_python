from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import HttpResponse
from django.contrib.auth.models import User
from .forms import RegistrationForm

# Create your views here.
def login_view(request):
    # Préparer le contexte pour le template
    context = {}
    
    # Si l'utilisateur est déjà connecté
    if request.user.is_authenticated:
        # Au lieu de rediriger, montrer un message indiquant que l'utilisateur est déjà connecté
        messages.info(request, f'You are already logged in as {request.user.username}')
        # Ajouter un indicateur pour afficher l'information dans le template
        context['already_logged_in'] = True
        return render(request, 'registration/login.html', context)
    
    # Traiter la soumission du formulaire
    if request.method == 'POST':
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        
        # Tenter d'authentifier l'utilisateur
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Authentification réussie
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect('post_list')
        else:
            # Échec d'authentification
            context['error'] = "Incorrect username or password"
            # Ajouter des messages spécifiques pour aider l'utilisateur
            if User.objects.filter(username=username).exists():
                context['error_detail'] = "Username exists but password is incorrect. Please try again."
    
    # Afficher le formulaire de connexion
    return render(request, 'registration/login.html', context)
    
def logout_view(request):
    # Déconnecter l'utilisateur, quelle que soit la méthode HTTP
    logout(request)
    # Ajouter un message de confirmation
    messages.success(request, 'You have been successfully logged out')
    return redirect('post_list')

def register_view(request):
    # Rediriger si l'utilisateur est déjà connecté
    if request.user.is_authenticated:
        return redirect('post_list')
        
    if request.method == 'POST':
        # Récupérer les données du formulaire HTML
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        # Validation manuelle
        error = False
        
        # Vérification que tous les champs requis sont remplis
        if not username:
            messages.error(request, 'Username is required')
            error = True
        if not email:
            messages.error(request, 'Email is required')
            error = True
        if not password1:
            messages.error(request, 'Password is required')
            error = True
        if not password2:
            messages.error(request, 'Password confirmation is required')
            error = True
        
        # Vérification que les mots de passe correspondent
        if password1 and password2 and password1 != password2:
            messages.error(request, 'Passwords do not match')
            error = True
        
        # Vérification que l'utilisateur n'existe pas déjà
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            error = True
        
        # Vérification que l'email n'existe pas déjà
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            error = True
        
        # Si aucune erreur, créer l'utilisateur
        if not error:
            try:
                # Créer l'utilisateur
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password1,
                    first_name=first_name,
                    last_name=last_name
                )
                
                # Ajouter un message de succès
                messages.success(request, f'Account successfully created for {user.username}! You can now login.')
                
                # Rediriger vers la page de connexion
                print("Redirecting to login_view after successful registration")
                return redirect('login_view')
            except Exception as e:
                print(f"Erreur lors de la création de l'utilisateur: {str(e)}")
                messages.error(request, f'Error creating account: {str(e)}')
    
    # Si la méthode n'est pas POST ou s'il y a des erreurs de validation
    return render(request, 'registration/register.html', {})