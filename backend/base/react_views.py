import os
import json
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.conf import settings

@ensure_csrf_cookie
def react_app(request):
    """
    Vue principale pour servir l'application React depuis Django
    """
    # On utilise le template généré par le build React
    return render(request, 'react_index.html')
