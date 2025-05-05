# Documentation du Flux d'Authentification

Ce document décrit le flux d'authentification de l'application TradeAssist, y compris l'inscription, la connexion, la vérification d'email et la gestion des sessions.

## Vue d'ensemble

L'application utilise NextAuth.js avec un adaptateur Prisma pour gérer l'authentification. Le flux d'authentification comprend les étapes suivantes:

1. Inscription de l'utilisateur
2. Vérification de l'email
3. Connexion
4. Accès au dashboard

## Composants clés

### 1. Middleware (`middleware.ts`)

Le middleware gère les redirections basées sur l'état d'authentification de l'utilisateur:
- Redirige les utilisateurs non authentifiés vers la page de connexion
- Redirige les utilisateurs authentifiés loin des pages publiques
- Détecte et prévient les boucles de redirection

### 2. AuthGuard (`components/auth-guard.tsx`)

Ce composant protège les routes qui nécessitent une authentification:
- Vérifie si l'utilisateur est connecté
- Vérifie si l'email de l'utilisateur est vérifié
- Affiche des messages d'erreur appropriés

### 3. Pages d'authentification

- `/login`: Page de connexion
- `/register`: Page d'inscription
- `/verify-email`: Page de vérification d'email
- `/emergency-fix`: Page de résolution des problèmes d'authentification
- `/bypass-auth`: Page de contournement pour les problèmes d'authentification

## Flux d'inscription et vérification

1. L'utilisateur s'inscrit via `/register`
2. Un email de vérification est envoyé (simulé dans l'environnement de développement)
3. L'utilisateur accède à `/verify-email` et entre le code de vérification
4. Une fois l'email vérifié, l'utilisateur est redirigé vers le dashboard

## Gestion des sessions

- Les sessions sont stockées dans des cookies JWT
- Le token JWT contient des informations sur l'état de vérification de l'email
- La session est mise à jour via `/api/auth/session`

## Résolution des problèmes

En cas de problème d'authentification:
1. Utiliser `/emergency-fix` pour réparer la session
2. Utiliser `/bypass-auth` pour contourner les vérifications
3. Vérifier les logs pour identifier les problèmes

## Codes de démonstration

Pour faciliter les tests:
- Code de vérification d'email: `123456`

## Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les sessions expirent après 30 jours
- Les tokens de vérification expirent après 24 heures

## Améliorations futures

- Implémentation de la récupération de mot de passe
- Authentification à deux facteurs
- Connexion via des fournisseurs OAuth (Google, GitHub, etc.)
