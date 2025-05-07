from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    username = forms.CharField(max_length=100,widget=forms.TextInput(attrs={'class':'form-control'}))
    email = forms.EmailField(max_length=100,widget=forms.TextInput(attrs={'class':'form-control'}))
    body = forms.CharField(widget=forms.Textarea(attrs={'class':'form-control','rows':4}))
    class Meta:
        model = Comment
        fields = ['username','email','body']
