# Icons Placeholder

Pour que la PWA fonctionne correctement, vous devez ajouter des icônes dans ce dossier.

## Tailles requises :
- icon-72.png (72×72px)
- icon-96.png (96×96px)
- icon-128.png (128×128px)
- icon-144.png (144×144px)
- icon-152.png (152×152px)
- icon-192.png (192×192px) ← Icône principale
- icon-384.png (384×384px)
- icon-512.png (512×512px) ← Splash screen

## Comment générer les icônes :

### Option 1 : PWA Asset Generator (Recommandé)
1. Aller sur https://www.pwabuilder.com/imageGenerator
2. Uploader votre logo (512×512 PNG avec fond)
3. Télécharger le pack d'icônes
4. Copier tous les fichiers dans ce dossier `icons/`

### Option 2 : Manuellement avec un outil graphique
- Créer un logo 512×512px
- Exporter aux différentes tailles listées ci-dessus
- Nommer exactement comme indiqué (ex: icon-192.png)

### Option 3 : Avec ImageMagick (ligne de commande)
```bash
# À partir d'un logo source.png de 512×512
convert source.png -resize 72x72 icon-72.png
convert source.png -resize 96x96 icon-96.png
convert source.png -resize 128x128 icon-128.png
convert source.png -resize 144x144 icon-144.png
convert source.png -resize 152x152 icon-152.png
convert source.png -resize 192x192 icon-192.png
convert source.png -resize 384x384 icon-384.png
convert source.png -resize 512x512 icon-512.png
```

## Notes :
- Les icônes doivent avoir un fond (pas de transparence pour le splash screen)
- Format PNG recommandé
- Privilégier des designs simples et lisibles en petite taille
