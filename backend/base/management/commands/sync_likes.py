from django.core.management.base import BaseCommand
from django.db import transaction
from base.models import Post, Likes
from django.contrib.auth.models import User
import logging

class Command(BaseCommand):
    help = 'Synchronise les likes existants depuis le champ ManyToManyField vers le modèle Likes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Début de la synchronisation des likes...'))
        
        # Compteurs pour le rapport
        likes_total = 0
        likes_created = 0
        posts_processed = 0
        
        try:
            with transaction.atomic():  # Utilisation d'une transaction pour garantir l'atomicité
                # Parcourir tous les posts qui ont des likes
                for post in Post.objects.prefetch_related('likes').all():
                    posts_processed += 1
                    likes_count = post.likes.count()
                    likes_total += likes_count
                    
                    if likes_count > 0:
                        self.stdout.write(f'Traitement du post "{post.title}" avec {likes_count} likes')
                        
                        # Pour chaque utilisateur qui a aimé le post
                        for user in post.likes.all():
                            # Vérifiez si le like existe déjà dans le nouveau modèle
                            like, created = Likes.objects.get_or_create(
                                user=user,
                                post=post
                            )
                            
                            if created:
                                likes_created += 1
                                self.stdout.write(f'  - Like créé pour {user.username}')
        
            # Afficher un résumé
            self.stdout.write(self.style.SUCCESS(
                f'Synchronisation terminée!\n'
                f'- Posts traités: {posts_processed}\n'
                f'- Likes existants: {likes_total}\n'
                f'- Nouveaux likes créés: {likes_created}'
            ))
            
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Une erreur est survenue: {str(e)}'))
            raise
