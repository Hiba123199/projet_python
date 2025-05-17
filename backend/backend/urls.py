"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from base.react_views import react_app

urlpatterns = [
    path('admin/', admin.site.urls),
    path('blog/', include('base.urls')),  # Accès au blog Django existant via /blog/
    path('accounts/', include('accounts.urls')),
    path('api/', include('base.api_urls')),  # Endpoints API pour React
    path('api-auth/', include('rest_framework.urls')),  # Authentification API
    
    # Route pour servir l'application React
    path('', react_app, name='react-app'),  # Vue principale pour l'application React
    re_path(r'^(?:.*)/?$', react_app),  # Toutes les autres routes sont gérées par React Router
]
