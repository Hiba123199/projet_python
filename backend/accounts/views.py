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
    
    # Vérifier si l'utilisateur est déjà connecté
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
        form = RegistrationForm(request.POST)
        if form.is_valid():
            try:
                # Enregistrer l'utilisateur avec les données du formulaire
                username = form.cleaned_data.get('username')
                password = form.cleaned_data.get('password1')  # Important: c'est password1 de UserCreationForm
                email = form.cleaned_data.get('email')
                first_name = form.cleaned_data.get('first_name')
                last_name = form.cleaned_data.get('last_name')
                
                # Créer l'utilisateur directement
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,  # Django hashera le mot de passe automatiquement
                    first_name=first_name,
                    last_name=last_name
                )
                
                # Ajouter un message de succès
                messages.success(request, f'Account successfully created for {user.username}! You can now login.')
                
                # Rediriger vers la page de connexion
                return redirect('login_view')
            except Exception as e:
                print(f"Erreur lors de la création de l'utilisateur: {str(e)}")
                messages.error(request, f'Error creating account: {str(e)}')
        else:
            # Afficher les erreurs du formulaire
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f'{field}: {error}')
    else:
        form = RegistrationForm()
    
    return render(request, 'registration/register.html', {'form': form})