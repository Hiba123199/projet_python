import os
import shutil
import subprocess
import sys

def main():
    """Script pour builder React et copier les fichiers vers Django"""
    # Chemins des répertoires
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    backend_dir = os.path.join(os.getcwd(), 'backend')
    react_build_dir = os.path.join(frontend_dir, 'build')
    django_static_dir = os.path.join(backend_dir, 'static', 'react')
    django_templates_dir = os.path.join(backend_dir, 'templates')
    
    # Vérifier que les répertoires existent
    if not os.path.exists(frontend_dir):
        print(f"Le répertoire frontend n'existe pas: {frontend_dir}")
        return False
    
    # Construire l'application React
    print("Construction de l'application React...")
    try:
        subprocess.check_call(['npm', 'run', 'build'], cwd=frontend_dir, shell=True)
    except subprocess.CalledProcessError:
        print("Erreur lors de la construction de React")
        return False
    
    # Créer les répertoires de destination si nécessaire
    os.makedirs(django_static_dir, exist_ok=True)
    os.makedirs(django_templates_dir, exist_ok=True)
    
    # Nettoyer les anciens fichiers statiques
    print("Nettoyage des anciens fichiers...")
    if os.path.exists(django_static_dir):
        shutil.rmtree(django_static_dir)
    
    # Copier les fichiers statiques (JS, CSS, médias) vers Django
    print("Copie des fichiers statiques...")
    shutil.copytree(
        os.path.join(react_build_dir, 'static'),
        django_static_dir
    )
    
    # Copier les autres fichiers statiques (favicon, manifest, etc.)
    for file in os.listdir(react_build_dir):
        if file != 'static' and file != 'index.html':
            src_path = os.path.join(react_build_dir, file)
            dst_path = os.path.join(backend_dir, 'static', file)
            if os.path.isfile(src_path):
                shutil.copy2(src_path, dst_path)
    
    # Copier et renommer index.html vers un template Django
    print("Copie du fichier index.html vers les templates Django...")
    index_src = os.path.join(react_build_dir, 'index.html')
    index_dst = os.path.join(django_templates_dir, 'react_index.html')
    shutil.copy2(index_src, index_dst)
    
    # Modifier les chemins dans le fichier index.html pour Django
    print("Mise à jour des chemins dans le template...")
    with open(index_dst, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remplacer les références aux fichiers statiques
    content = content.replace('"/static/', "{% static 'react/")
    content = content.replace('.js"', ".js' %}")
    content = content.replace('.css"', ".css' %}")
    content = content.replace('.chunk.js"', ".chunk.js' %}")
    content = content.replace('.chunk.css"', ".chunk.css' %}")
    
    # Ajouter la balise load static de Django
    content = "{% load static %}\n" + content
    
    with open(index_dst, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print("Processus de build terminé avec succès!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
