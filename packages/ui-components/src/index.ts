/**
 * Couche 2 — Middleware applicatif : Composants UI partagés
 *
 * Ces composants sont modulaires et interchangeables entre toutes les
 * applications (production-app, logistics-app, sales-app, admin-dashboard).
 *
 * Chaque application peut :
 *  - Importer directement ces composants de base
 *  - Les surcharger localement dans src/components/ui/ pour adapter
 *    la charte graphique au rôle métier (ex: couleurs, taille)
 *
 * Usage :
 *   import { Button, Card, Badge, StatusBadge } from '@aeronexis-dynamics/ui-components'
 */

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

// ─── Types partagés ──────────────────────────────────────────────────────────

export type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
export type Size = 'sm' | 'md' | 'lg'
export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray'

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  children: ReactNode
}

export interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, StatusColor>
  labelMap?: Record<string, string>
}

// ─── Composants ──────────────────────────────────────────────────────────────
// Les implémentations sont volontairement exportées comme types/interfaces
// pour permettre aux apps de fournir leur propre implémentation stylisée
// tout en respectant le contrat de props.
//
// Pour une implémentation React complète avec Tailwind, chaque app crée
// son propre src/components/ui/<Component>.tsx qui satisfait ces interfaces.

export type { ReactNode }
