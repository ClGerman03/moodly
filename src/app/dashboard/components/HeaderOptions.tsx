'use client'

/**
 * Opciones del Encabezado del Dashboard
 * 
 * Componente que contiene elementos interactivos para el encabezado del dashboard,
 * incluyendo el popover de perfil y otras opciones futuras.
 */

import { useAuth } from '@/contexts/AuthContext'
import ProfilePopover from '@/components/ui/popups/ProfilePopover'

export default function HeaderOptions() {
  const { user } = useAuth()

  return (
    <div className="flex items-center space-x-2">
      {/* Aquí podemos agregar más opciones en el futuro */}
      {user && <ProfilePopover user={user} />}
    </div>
  )
}
