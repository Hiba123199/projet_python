from django.urls import path
from . import views
from . import api
from . import register_view
from . import direct_auth


urlpatterns = [
    # Routes traditionnelles pour les vues Django
    path('login/', views.login_view, name='login_view'),
    path('logout/', views.logout_view, name='logout_view'),
    path('register/', views.register_view, name='register_view'),
    
    # Routes API pour React
    path('api/login/', api.login_api, name='login_api'),
    path('api/register/', api.register_api, name='register_api'),
    path('api/logout/', api.logout_api, name='logout_api'),
    path('api/user/', api.user_api, name='user_api'),
    
    # Routes d'authentification directes (simplifiées)
    path('register-direct/', register_view.direct_register, name='direct_register'),
    path('direct-login/', direct_auth.direct_login, name='direct_login'),
    path('direct-logout/', direct_auth.direct_logout, name='direct_logout'),
]
