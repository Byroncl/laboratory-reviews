import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'es' | 'en';

interface TranslationMap {
  [key: string]: string | TranslationMap;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private currentLanguage$ = new BehaviorSubject<Language>('es');

  private translations: Record<Language, TranslationMap> = {
    es: {
      sidebar: {
        dashboard: 'Panel de control',
        posts: 'Gestionar Posts',
        users: 'Gestionar Usuarios',
        roles: 'Gestionar Roles',
        permissions: 'Gestionar Permisos',
        comments: 'Gestionar Comentarios',
        files: 'Gestionar Archivos',
        auditLogs: 'Registros de Auditoría',
        logout: 'Cerrar sesión'
      },
      navbar: {
        language: 'Idioma',
        spanish: 'Español',
        english: 'English',
        selectLanguage: 'Seleccionar idioma'
      },
      auth: {
        login: {
          title: 'Bienvenido de vuelta',
          subtitle: 'Inicia sesión en tu cuenta para continuar',
          username: 'Nombre de usuario',
          email: 'Correo o usuario',
          password: 'Contraseña',
          rememberMe: 'Recordar mi contraseña',
          signIn: 'Iniciar sesión',
          signing: 'Iniciando...',
          noAccount: '¿No tienes cuenta?',
          createAccount: 'Crear cuenta',
          copyright: '© 2024 Albatros. Todos los derechos reservados.',
          types: {
            user: 'Usuario Administrativo',
            client: 'Cliente'
          },
          errors: {
            usernameRequired: 'Se requiere nombre de usuario',
            invalidEmail: 'Correo inválido',
            minPassword: 'Mínimo 6 caracteres'
          }
        },
        register: {
          title: 'Crear cuenta',
          subtitle: 'Regístrate para comenzar',
          fullName: 'Nombre completo',
          lastName: 'Apellido',
          username: 'Nombre de usuario',
          email: 'Correo electrónico',
          password: 'Contraseña',
          confirmPassword: 'Confirmar contraseña',
          accountType: 'Tipo de cuenta',
          createAccount: 'Crear cuenta',
          creating: 'Creando cuenta...',
          haveAccount: '¿Ya tienes cuenta?',
          signIn: 'Iniciar sesión',
          terms: 'Al crear una cuenta, aceptas nuestros',
          termsLink: 'Términos de servicio',
          joinTitle: 'Únete a nosotros',
          joinSubtitle: 'Crea tu cuenta y comienza a gestionar tu plataforma hoy',
          types: {
            user: 'Usuario Administrativo',
            client: 'Cliente'
          },
          errors: {
            nameRequired: 'Se requiere nombre (mínimo 2 caracteres)',
            lastNameRequired: 'Se requiere apellido (mínimo 2 caracteres)',
            usernameRequired: 'Se requiere nombre de usuario (3-20 caracteres)',
            invalidEmail: 'Correo electrónico inválido',
            minPassword: 'Mínimo 6 caracteres',
            confirmRequired: 'Confirma tu contraseña',
            passwordMismatch: 'Las contraseñas no coinciden'
          }
        },
        common: {
          error: 'Error',
          back: '← Atrás'
        },
        messages: {
          loginSuccess: 'Sesión iniciada correctamente',
          loginError: 'Usuario o contraseña incorrectos',
          registerSuccess: 'Cuenta creada correctamente. Por favor inicia sesión.',
          registerError: 'Error al crear la cuenta',
          logoutSuccess: 'Sesión cerrada correctamente',
          tokenExpired: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          tokenInvalid: 'Token de sesión inválido. Por favor inicia sesión nuevamente.',
          networkError: 'Error de red. Por favor verifica tu conexión.',
          validationError: 'Por favor corrige los errores indicados',
          passwordMismatch: 'Las contraseñas no coinciden',
          emailTaken: 'Este correo ya está en uso',
          usernameTaken: 'Este nombre de usuario ya está en uso',
          weakPassword: 'Contraseña muy débil. Usa mayúsculas, minúsculas, números y símbolos.',
          accountLocked: 'Cuenta bloqueada. Intenta nuevamente más tarde.',
          sessionExpired: 'Tu sesión ha expirado.',
          unauthorized: 'No estás autorizado para acceder a este recurso.',
          forbidden: 'Acceso denegado.'
        }
      },
      dashboard: {
        common: {
          validation: {
            required: 'Este campo es requerido',
            minLength: 'Mínimo {n} caracteres',
            maxLength: 'Máximo {n} caracteres',
            invalid: 'Campo inválido'
          }
        },
        posts: {
          loadError: 'Error al cargar posts',
          createSuccess: 'Post creado correctamente',
          createError: 'Error al crear post',
          updateSuccess: 'Post actualizado correctamente',
          updateError: 'Error al actualizar post',
          deleteSuccess: 'Post eliminado correctamente',
          deleteError: 'Error al eliminar el post',
          deleteConfirmTitle: 'Confirmar eliminación',
          deleteConfirmBody: '¿Estás seguro de que deseas eliminar "{name}"?',
          formIncomplete: 'Por favor complete los campos requeridos',
          viewOpened: 'Post abierto',
          validation: {
            urlPattern: 'URL debe comenzar con http:// o https://'
          },
          newPost: '+ Nuevo Post',
          editTitle: 'Editar Post',
          createTitle: 'Crear Nuevo Post',
          searchPlaceholder: 'Buscar posts...',
          allStatuses: 'Todos los estados',
          published: 'Publicado',
          draft: 'Borrador',
          archived: 'Archivado',
          clearFilters: 'Limpiar filtros',
          noResults: 'No hay posts que coincidan con los filtros',
          totalPosts: 'Total de Posts',
          publishedCount: 'Publicados',
          draftCount: 'En Borrador'
        },
        users: {
          loadError: 'Error al cargar usuarios',
          createSuccess: 'Usuario creado correctamente',
          createError: 'Error al crear usuario',
          updateSuccess: 'Usuario actualizado correctamente',
          updateError: 'Error al actualizar usuario',
          deleteSuccess: 'Usuario eliminado correctamente',
          deleteError: 'Error al eliminar el usuario',
          deleteConfirmTitle: 'Confirmar eliminación',
          deleteConfirmBody: '¿Estás seguro de que deseas eliminar a {name}?',
          toggleSuccess: 'Usuario {status} correctamente',
          toggleError: 'Error al cambiar el estado del usuario',
          formIncomplete: 'Por favor complete todos los campos requeridos',
          validation: {
            emailInvalid: 'Email inválido'
          },
          newUser: '+ Nuevo Usuario',
          editTitle: 'Editar Usuario',
          createTitle: 'Crear Nuevo Usuario',
          searchPlaceholder: 'Buscar por nombre o email...',
          allRoles: 'Todos los roles',
          allStatuses: 'Todos los estados',
          clearFilters: '✕ Limpiar filtros',
          noResults: 'No hay usuarios que coincidan con los filtros',
          totalUsers: 'Total Users',
          active: 'Activos',
          admins: 'Administradores',
          suspended: 'Suspendidos'
        },
        roles: {
          loadError: 'Error al cargar roles',
          createSuccess: 'Rol creado correctamente',
          createError: 'Error al crear rol',
          updateSuccess: 'Rol actualizado correctamente',
          updateError: 'Error al actualizar rol',
          deleteSuccess: 'Rol eliminado correctamente',
          deleteError: 'Error al eliminar el rol',
          deleteConfirmTitle: 'Confirmar eliminación',
          deleteConfirmBody: '¿Estás seguro de que deseas eliminar el rol "{name}"?',
          deleteConfirmInline: '¿Estás seguro de que deseas eliminar este rol?',
          permissionsAssignSuccess: 'Permisos asignados correctamente',
          permissionsAssignError: 'Error al asignar permisos',
          formIncomplete: 'Por favor complete todos los campos requeridos',
          validation: {
            permissionsRequired: 'Debe seleccionar al menos un permiso'
          },
          newRole: '+ Nuevo Rol',
          editTitle: 'Editar Rol',
          createTitle: 'Crear Nuevo Rol',
          managePermissions: 'Gestionar Permisos',
          searchPlaceholder: 'Buscar por nombre...',
          clearFilters: '✕ Limpiar filtros',
          noResults: 'No hay roles que coincidan con los filtros',
          totalRoles: 'Total Roles'
        },
        permissions: {
          loadError: 'Error al cargar permisos',
          createSuccess: 'Permiso creado correctamente',
          createError: 'Error al crear permiso',
          updateSuccess: 'Permiso actualizado correctamente',
          updateError: 'Error al actualizar permiso',
          deleteSuccess: 'Permiso eliminado correctamente',
          deleteError: 'Error al eliminar el permiso',
          deleteConfirmTitle: 'Confirmar eliminación',
          deleteConfirmBody: '¿Estás seguro de que deseas eliminar el permiso "{name}"?',
          deleteConfirmInline: '¿Estás seguro de que deseas eliminar este permiso?',
          formIncomplete: 'Por favor complete todos los campos requeridos',
          newPermission: '+ Nuevo Permiso',
          editTitle: 'Editar Permiso',
          createTitle: 'Crear Nuevo Permiso',
          searchPlaceholder: 'Buscar por nombre...',
          clearFilters: '✕ Limpiar filtros',
          noResults: 'No hay permisos que coincidan con los filtros',
          totalPermissions: 'Total Permisos'
        },
        auditLogs: {
          loadError: 'Error al cargar registros de auditoría',
          title: 'Audit Logs',
          searchPlaceholder: 'Search user or path...',
          allActions: 'All actions',
          allEntityTypes: 'All entity types',
          clearFilters: '✕ Clear filters',
          from: 'From:',
          to: 'To:',
          noResults: 'No audit log entries match the current filters',
          detailTitle: 'Audit Log Detail',
          timestamp: 'Timestamp',
          user: 'User',
          action: 'Action',
          status: 'Status',
          entityType: 'Entity Type',
          entityId: 'Entity ID',
          method: 'Method',
          path: 'Path',
          ip: 'IP',
          before: 'Before',
          after: 'After',
          metadata: 'Metadata'
        },
        profile: {
          loadError: 'Error al cargar perfil',
          updateSuccess: 'Perfil actualizado correctamente',
          updateError: 'Error al actualizar perfil',
          passwordChangeSuccess: 'Contraseña cambiada correctamente',
          passwordChangeError: 'Error al cambiar la contraseña',
          title: 'Profile Information',
          firstName: 'First Name',
          lastName: 'Last Name',
          bio: 'Bio',
          language: 'Language',
          saveChanges: 'Save Changes',
          saving: 'Saving...',
          changePassword: 'Change Password',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          confirmPassword: 'Confirm Password',
          changePasswordBtn: 'Change Password',
          changing: 'Changing...',
          passwordMinLength: 'Password must be at least 8 characters',
          passwordMismatch: 'Passwords do not match',
          accountDetails: 'Account Details',
          username: 'Username',
          email: 'Email',
          status: 'Status',
          verified: 'Verified',
          memberSince: 'Member Since',
          lastLogin: 'Last Login',
          active: 'Active',
          inactive: 'Inactive',
          verifiedStatus: 'Verified',
          notVerified: 'Not verified'
        },
        overview: {
          postsTotal: 'Posts Totales',
          comments: 'Comentarios',
          activeUsers: 'Usuarios Activos',
          growth: 'Crecimiento',
          growthTrend: 'En aumento',
          welcomeTitle: '¡Bienvenido,',
          welcomeBody: 'Este es tu panel de gestión integral. Puedes administrar posts, usuarios, roles, permisos, comentarios y archivos desde un único lugar de manera segura y eficiente.'
        },
        postForm: {
          titleLabel: 'Título',
          contentLabel: 'Contenido',
          imageUrlLabel: 'URL de Imagen (Opcional)',
          imageFilenameLabel: 'Nombre de archivo de imagen (Opcional)',
          categoryIdLabel: 'ID de Categoría (Opcional)',
          categoryNameLabel: 'Nombre de Categoría (Opcional)',
          titlePlaceholder: 'Ej: Mi primer post',
          contentPlaceholder: 'Escribe el contenido del post...',
          imageUrlPlaceholder: 'Ej: http://localhost:9000/posts/image.jpg',
          imageFilenamePlaceholder: 'Ej: 1718000000000-photo.jpg',
          categoryIdPlaceholder: 'Ej: 507f1f77bcf86cd799439011',
          categoryNamePlaceholder: 'Ej: Backend',
          updatePost: 'Actualizar Post',
          createPost: 'Crear Post',
          cancel: 'Cancelar',
          characters: 'caracteres'
        },
        userForm: {
          nameLabel: 'Nombre',
          lastnameLabel: 'Apellido',
          usernameLabel: 'Usuario',
          emailLabel: 'Email',
          passwordLabel: 'Contraseña',
          typeLabel: 'Tipo de Usuario',
          namePlaceholder: 'Ej: Juan',
          lastnamePlaceholder: 'Ej: Pérez',
          usernamePlaceholder: 'Ej: juan.perez',
          emailPlaceholder: 'Ej: juan@example.com',
          passwordPlaceholder: 'Mínimo 6 caracteres',
          selectType: 'Seleccionar tipo...',
          updateUser: 'Actualizar Usuario',
          createUser: 'Crear Usuario',
          cancel: 'Cancelar'
        },
        roleForm: {
          nameLabel: 'Nombre del Rol',
          permissionsLabel: 'Permisos Asignados',
          namePlaceholder: 'Ej: Administrador',
          loadingPermissions: 'Cargando permisos...',
          selectedCount: 'permisos seleccionados',
          updateRole: 'Actualizar Rol',
          createRole: 'Crear Rol',
          cancel: 'Cancelar'
        },
        permissionForm: {
          nameLabel: 'Nombre del Permiso',
          typeLabel: 'Categoría del Permiso',
          namePlaceholder: 'Ej: Crear Usuario',
          selectCategory: 'Seleccionar categoría...',
          availableTypes: 'Tipos disponibles:',
          updatePermission: 'Actualizar Permiso',
          createPermission: 'Crear Permiso',
          cancel: 'Cancelar'
        },
        rolePermissions: {
          title: 'Asignar Permisos',
          roleLabel: 'Rol:',
          selectAll: 'Todos',
          deselectAll: 'Ninguno',
          noPermissions: 'No hay permisos disponibles',
          savePermissions: 'Guardar Permisos',
          cancel: 'Cancelar'
        }
      },
      client: {
        profile: {
          title: 'Mi Perfil',
          personal_info: 'Información Personal',
          change_password: 'Cambiar Contraseña',
          account_info: 'Información de Cuenta',
          update_success: 'Perfil actualizado correctamente',
          update_error: 'Error al actualizar perfil',
          password_success: 'Contraseña cambiada correctamente',
          password_error: 'Error al cambiar contraseña',
          loading: 'Cargando perfil...',
          loadError: 'Error al cargar perfil'
        },
        my_posts: {
          title: 'Mis Posts',
          empty: 'No tienes posts aún.',
          create_button: 'Crear Post',
          cancel_button: 'Cancelar',
          loading: 'Cargando...',
          pagination_previous: '← Anterior',
          pagination_next: 'Siguiente →'
        },
        my_comments: {
          title: 'Mis Comentarios',
          empty: 'No tienes comentarios aún.',
          loading: 'Cargando...',
          delete_confirm: '¿Estás seguro de eliminar este comentario?'
        },
        my_favorites: {
          title: 'Mis Favoritos',
          empty: 'No tienes favoritos aún.',
          loading: 'Cargando...',
          pagination_previous: '← Anterior',
          pagination_next: 'Siguiente →',
          load_error: 'Error al cargar los favoritos.',
          remove_error: 'Error al eliminar el favorito.'
        },
        post_form: {
          create_title: 'Crear Post',
          update_title: 'Editar Post',
          title_label: 'Título',
          body_label: 'Contenido',
          category_label: 'Categoría',
          create_button: 'Crear',
          update_button: 'Actualizar',
          cancel_button: 'Cancelar'
        },
        validation: {
          post_title_min: 'El título debe tener al menos 3 caracteres',
          post_body_min: 'El contenido debe tener al menos 10 caracteres',
          password_min: 'La contraseña debe tener al menos 8 caracteres',
          password_mismatch: 'Las contraseñas no coinciden',
          name_required: 'El nombre es requerido',
          email_required: 'El email es requerido'
        },
        nav: {
          myPosts: 'Mis posts',
          myFavorites: 'Mis favoritos',
          myComments: 'Mis comentarios',
          myProfile: 'Mi perfil'
        },
        postCard: {
          by: 'Por',
          view: 'Ver',
          edit: 'Editar',
          delete: 'Eliminar'
        },
        commentCard: {
          delete: 'Eliminar',
          viewPost: 'Ver post'
        },
        postForm: {
          saving: 'Guardando...'
        },
        myComments: {
          loadError: 'Error al cargar comentarios',
          deleteError: 'Error al eliminar comentario'
        },
        myPosts: {
          loadError: 'Error al cargar posts',
          updateError: 'Error al actualizar post',
          createError: 'Error al crear post',
          deleteError: 'Error al eliminar post',
          deleteConfirm: '¿Estás seguro de que deseas eliminar este post?'
        },
        messages: {
          loadError: 'Error al cargar datos',
          deleteError: 'Error al eliminar',
          deleted: 'Eliminado correctamente',
          updated: 'Actualizado correctamente',
          updateError: 'Error al actualizar',
          created: 'Creado correctamente',
          createError: 'Error al crear'
        }
      },
      home: {
        header: {
          logoAlt: 'Albatros inicio',
          logout: 'Cerrar sesión',
          signIn: 'Iniciar sesión',
          register: 'Registrarse'
        },
        hero: {
          title: 'Descubre',
          subtitle: 'Explora posts, únete a la conversación y comparte tus ideas.',
          ctaAuthenticated: 'Crear Post',
          ctaGuest: 'Inicia sesión para comentar'
        },
        search: {
          placeholder: 'Buscar posts...'
        },
        empty: {
          search: 'No hay posts que coincidan con tu búsqueda.',
          posts: 'Sin posts aún.',
          loadError: 'Error al cargar posts.'
        },
        postCard: {
          by: 'por'
        },
        retry: 'Reintentar',
        categories: 'Categorías',
        allPosts: 'Todos los Posts',
        featuredUsers: 'Usuarios Destacados',
        noUsers: 'Sin usuarios destacados',
        about: 'Acerca de',
        aboutText: '¡Bienvenido a nuestra comunidad! Explora posts, participa en discusiones y conecta con otros que comparten tus intereses.'
      },
      posts: {
        postCard: {
          deleteConfirm: '¿Estás seguro de que deseas eliminar este post?'
        },
        list: {
          title: 'Posts',
          newPost: 'Nuevo Post',
          loading: 'Cargando posts...',
          error: 'Error al cargar posts',
          empty: 'No se encontraron posts.',
          backToPosts: '← Volver a Posts'
        },
        detail: {
          loading: 'Cargando post...',
          error: 'Error al cargar post',
          published: 'Publicado',
          views: 'Vistas',
          tags: 'Etiquetas',
          commentsTitle: 'Comentarios',
          commentsLoading: 'Cargando comentarios...',
          commentsError: 'Error al cargar comentarios',
          commentsEmpty: 'Sin comentarios aún. ¡Sé el primero en comentar!'
        },
        form: {
          createTitle: 'Crear Nuevo Post',
          editTitle: 'Editar Post',
          titleLabel: 'Título',
          titlePlaceholder: 'Título del post...',
          contentLabel: 'Contenido',
          contentPlaceholder: 'Contenido del post...',
          statusLabel: 'Estado',
          statusDefault: 'Sin estado (borrador)',
          tagsLabel: 'Etiquetas (separadas por coma)',
          tagsPlaceholder: 'tag1, tag2, tag3...',
          save: 'Guardar Post',
          saving: 'Guardando...',
          cancel: 'Cancelar'
        },
        card: {
          by: 'Por',
          date: 'Fecha',
          comments: 'Comentarios',
          view: 'Ver',
          edit: 'Editar',
          publish: 'Publicar',
          archive: 'Archivar',
          delete: 'Eliminar',
          save: 'Guardar',
          saved: 'Guardado'
        },
        filter: {
          searchLabel: 'Buscar',
          searchPlaceholder: 'Buscar por título, contenido o autor...',
          authorLabel: 'Autor',
          authorPlaceholder: 'Filtrar por autor...',
          statusLabel: 'Estado',
          allStatuses: 'Todos los estados',
          tagsLabel: 'Etiquetas (separadas por coma)',
          tagsPlaceholder: 'angular, nestjs...',
          fromDate: 'Desde',
          toDate: 'Hasta',
          resetFilters: 'Restablecer Filtros'
        },
        comment: {
          label: 'Comentario',
          placeholder: 'Agregar un comentario...',
          submit: 'Enviar',
          submitting: 'Enviando...',
          cancel: 'Cancelar',
          signInGate: 'Inicia sesión para comentar'
        },
        reaction: {
          signInTitle: 'Inicia sesión para reaccionar',
          signInBody: 'Debes iniciar sesión para dejar una reacción.',
          signInBtn: 'Iniciar sesión',
          registerBtn: 'Registrarse',
          cancelBtn: 'Cancelar'
        },
        comments: {
          anonymous: 'Anónimo',
          reply: 'Responder',
          cancelReply: 'Cancelar Respuesta',
          loadingReplies: 'Cargando respuestas...',
          hideReplies: 'Ocultar Respuestas',
          showReplies: 'Mostrar Respuestas',
          edit: 'Editar',
          delete: 'Eliminar',
          save: 'Guardar',
          cancel: 'Cancelar',
          deleting: 'Eliminando...'
        },
        reply: {
          placeholder: 'Responder comentario...',
          submit: 'Responder',
          submitting: 'Respondiendo...',
          cancel: 'Cancelar',
          loaded: 'Respuestas cargadas',
          error: 'Error al cargar respuestas',
        },
        bulk: {
          title: 'Carga Masiva de Posts',
          chooseFile: 'Elegir Archivo JSON',
          upload: 'Subir Posts',
          uploading: 'Subiendo...',
          parsedInfo: 'post(s) válidos listos'
        },
        pagination: {
          info: 'Página',
          of: 'de',
          total: 'elementos totales',
          previous: '← Anterior',
          next: 'Siguiente →'
        }
      },
      profile: {
        info: {
          title: 'Información del Perfil',
          firstName: 'Nombre',
          lastName: 'Apellido',
          bio: 'Biografía',
          language: 'Idioma',
          save: 'Guardar Cambios',
          saving: 'Guardando...'
        },
        password: {
          title: 'Cambiar Contraseña',
          current: 'Contraseña Actual',
          new: 'Nueva Contraseña',
          confirm: 'Confirmar Contraseña',
          change: 'Cambiar Contraseña',
          changing: 'Cambiando...',
          minLength: 'La contraseña debe tener al menos 8 caracteres',
          mismatch: 'Las contraseñas no coinciden'
        },
        account: {
          title: 'Detalles de Cuenta',
          username: 'Usuario',
          email: 'Email',
          status: 'Estado',
          verified: 'Verificado',
          notVerified: 'No verificado',
          active: 'Activo',
          inactive: 'Inactivo',
          memberSince: 'Miembro Desde',
          lastLogin: 'Último Acceso',
          userId: 'ID de Usuario'
        },
        noPermission: 'No tienes permiso para editar este perfil',
        personalInfo: 'Información Personal',
        name: 'Nombre',
        lastname: 'Apellido',
        email: 'Email'
      },
      navigation: {
        menu: 'Menú',
        feed: 'Feed',
        myPosts: 'Mis Posts',
        myFavorites: 'Mis Favoritos',
        myComments: 'Mis Comentarios',
        myProfile: 'Mi Perfil',
        backHome: 'Volver al Inicio'
      },
      feed: {
        description: 'Explora las publicaciones de la comunidad y participa',
        empty: 'No hay publicaciones disponibles en este momento'
      },
      activity: {
        recentActivity: 'Actividad Reciente',
        noActivity: 'Sin actividad reciente'
      },
      stats: {
        yourStats: 'Tus Estadísticas',
        posts: 'Posts',
        comments: 'Comentarios',
        favorites: 'Favoritos'
      },
      trending: {
        trending: 'Tendencias'
      }
    },
    en: {
      sidebar: {
        dashboard: 'Dashboard',
        posts: 'Manage Posts',
        users: 'Manage Users',
        roles: 'Manage Roles',
        permissions: 'Manage Permissions',
        comments: 'Manage Comments',
        files: 'Manage Files',
        auditLogs: 'Audit Logs',
        logout: 'Log out'
      },
      navbar: {
        language: 'Language',
        spanish: 'Español',
        english: 'English',
        selectLanguage: 'Select language'
      },
      auth: {
        login: {
          title: 'Welcome back',
          subtitle: 'Sign in to your account to continue',
          username: 'Username',
          email: 'Email or username',
          password: 'Password',
          rememberMe: 'Remember my password',
          signIn: 'Sign in',
          signing: 'Signing in...',
          noAccount: "Don't have an account?",
          createAccount: 'Create account',
          copyright: '© 2024 Albatros. All rights reserved.',
          types: {
            user: 'Admin User',
            client: 'Client'
          },
          errors: {
            usernameRequired: 'Username is required',
            invalidEmail: 'Invalid email',
            minPassword: 'Minimum 6 characters'
          }
        },
        register: {
          title: 'Create account',
          subtitle: 'Sign up to get started',
          fullName: 'Full name',
          lastName: 'Last name',
          username: 'Username',
          email: 'Email address',
          password: 'Password',
          confirmPassword: 'Confirm password',
          accountType: 'Account type',
          createAccount: 'Create account',
          creating: 'Creating account...',
          haveAccount: 'Already have an account?',
          signIn: 'Sign in',
          terms: 'By creating an account, you agree to our',
          termsLink: 'Terms of Service',
          joinTitle: 'Join us',
          joinSubtitle: 'Create your account and start managing your platform today',
          types: {
            user: 'Admin User',
            client: 'Client'
          },
          errors: {
            nameRequired: 'Name is required (at least 2 characters)',
            lastNameRequired: 'Last name is required (at least 2 characters)',
            usernameRequired: 'Username is required (3-20 characters)',
            invalidEmail: 'Please enter a valid email',
            minPassword: 'Password must be at least 6 characters',
            confirmRequired: 'Confirm password is required',
            passwordMismatch: 'Passwords do not match'
          }
        },
        common: {
          error: 'Error',
          back: '← Back'
        },
        messages: {
          loginSuccess: 'Logged in successfully',
          loginError: 'Invalid username or password',
          registerSuccess: 'Account created successfully. Please log in.',
          registerError: 'Failed to create account',
          logoutSuccess: 'Logged out successfully',
          tokenExpired: 'Your session has expired. Please log in again.',
          tokenInvalid: 'Invalid session token. Please log in again.',
          networkError: 'Network error. Please check your connection.',
          validationError: 'Please fix the errors below',
          passwordMismatch: 'Passwords do not match',
          emailTaken: 'This email is already in use',
          usernameTaken: 'This username is already in use',
          weakPassword: 'Password is too weak. Use uppercase, lowercase, numbers, and symbols.',
          accountLocked: 'Account is locked. Please try again later.',
          sessionExpired: 'Your session has expired.',
          unauthorized: 'You are not authorized to access this resource.',
          forbidden: 'Access denied.'
        }
      },
      dashboard: {
        common: {
          validation: {
            required: 'This field is required',
            minLength: 'Minimum {n} characters',
            maxLength: 'Maximum {n} characters',
            invalid: 'Invalid field'
          }
        },
        posts: {
          loadError: 'Error loading posts',
          createSuccess: 'Post created successfully',
          createError: 'Error creating post',
          updateSuccess: 'Post updated successfully',
          updateError: 'Error updating post',
          deleteSuccess: 'Post deleted successfully',
          deleteError: 'Error deleting post',
          deleteConfirmTitle: 'Confirm deletion',
          deleteConfirmBody: 'Are you sure you want to delete "{name}"?',
          formIncomplete: 'Please complete the required fields',
          viewOpened: 'Post opened',
          validation: {
            urlPattern: 'URL must start with http:// or https://'
          },
          newPost: '+ New Post',
          editTitle: 'Edit Post',
          createTitle: 'Create New Post',
          searchPlaceholder: 'Search posts...',
          allStatuses: 'All statuses',
          published: 'Published',
          draft: 'Draft',
          archived: 'Archived',
          clearFilters: 'Clear filters',
          noResults: 'No posts match the current filters',
          totalPosts: 'Total Posts',
          publishedCount: 'Published',
          draftCount: 'Draft'
        },
        users: {
          loadError: 'Error loading users',
          createSuccess: 'User created successfully',
          createError: 'Error creating user',
          updateSuccess: 'User updated successfully',
          updateError: 'Error updating user',
          deleteSuccess: 'User deleted successfully',
          deleteError: 'Error deleting user',
          deleteConfirmTitle: 'Confirm deletion',
          deleteConfirmBody: 'Are you sure you want to delete {name}?',
          toggleSuccess: 'User {status} successfully',
          toggleError: 'Error changing user status',
          formIncomplete: 'Please complete all required fields',
          validation: {
            emailInvalid: 'Invalid email'
          },
          newUser: '+ New User',
          editTitle: 'Edit User',
          createTitle: 'Create New User',
          searchPlaceholder: 'Search by name or email...',
          allRoles: 'All roles',
          allStatuses: 'All statuses',
          clearFilters: '✕ Clear filters',
          noResults: 'No users match the current filters',
          totalUsers: 'Total Users',
          active: 'Active',
          admins: 'Administrators',
          suspended: 'Suspended'
        },
        roles: {
          loadError: 'Error loading roles',
          createSuccess: 'Role created successfully',
          createError: 'Error creating role',
          updateSuccess: 'Role updated successfully',
          updateError: 'Error updating role',
          deleteSuccess: 'Role deleted successfully',
          deleteError: 'Error deleting role',
          deleteConfirmTitle: 'Confirm deletion',
          deleteConfirmBody: 'Are you sure you want to delete role "{name}"?',
          deleteConfirmInline: 'Are you sure you want to delete this role?',
          permissionsAssignSuccess: 'Permissions assigned successfully',
          permissionsAssignError: 'Error assigning permissions',
          formIncomplete: 'Please complete all required fields',
          validation: {
            permissionsRequired: 'You must select at least one permission'
          },
          newRole: '+ New Role',
          editTitle: 'Edit Role',
          createTitle: 'Create New Role',
          managePermissions: 'Manage Permissions',
          searchPlaceholder: 'Search by name...',
          clearFilters: '✕ Clear filters',
          noResults: 'No roles match the current filters',
          totalRoles: 'Total Roles'
        },
        permissions: {
          loadError: 'Error loading permissions',
          createSuccess: 'Permission created successfully',
          createError: 'Error creating permission',
          updateSuccess: 'Permission updated successfully',
          updateError: 'Error updating permission',
          deleteSuccess: 'Permission deleted successfully',
          deleteError: 'Error deleting permission',
          deleteConfirmTitle: 'Confirm deletion',
          deleteConfirmBody: 'Are you sure you want to delete permission "{name}"?',
          deleteConfirmInline: 'Are you sure you want to delete this permission?',
          formIncomplete: 'Please complete all required fields',
          newPermission: '+ New Permission',
          editTitle: 'Edit Permission',
          createTitle: 'Create New Permission',
          searchPlaceholder: 'Search by name...',
          clearFilters: '✕ Clear filters',
          noResults: 'No permissions match the current filters',
          totalPermissions: 'Total Permissions'
        },
        auditLogs: {
          loadError: 'Error loading audit logs',
          title: 'Audit Logs',
          searchPlaceholder: 'Search user or path...',
          allActions: 'All actions',
          allEntityTypes: 'All entity types',
          clearFilters: '✕ Clear filters',
          from: 'From:',
          to: 'To:',
          noResults: 'No audit log entries match the current filters',
          detailTitle: 'Audit Log Detail',
          timestamp: 'Timestamp',
          user: 'User',
          action: 'Action',
          status: 'Status',
          entityType: 'Entity Type',
          entityId: 'Entity ID',
          method: 'Method',
          path: 'Path',
          ip: 'IP',
          before: 'Before',
          after: 'After',
          metadata: 'Metadata'
        },
        profile: {
          loadError: 'Error loading profile',
          updateSuccess: 'Profile updated successfully',
          updateError: 'Error updating profile',
          passwordChangeSuccess: 'Password changed successfully',
          passwordChangeError: 'Error changing password',
          title: 'Profile Information',
          firstName: 'First Name',
          lastName: 'Last Name',
          bio: 'Bio',
          language: 'Language',
          saveChanges: 'Save Changes',
          saving: 'Saving...',
          changePassword: 'Change Password',
          currentPassword: 'Current Password',
          newPassword: 'New Password',
          confirmPassword: 'Confirm Password',
          changePasswordBtn: 'Change Password',
          changing: 'Changing...',
          passwordMinLength: 'Password must be at least 8 characters',
          passwordMismatch: 'Passwords do not match',
          accountDetails: 'Account Details',
          username: 'Username',
          email: 'Email',
          status: 'Status',
          verified: 'Verified',
          memberSince: 'Member Since',
          lastLogin: 'Last Login',
          active: 'Active',
          inactive: 'Inactive',
          verifiedStatus: 'Verified',
          notVerified: 'Not verified'
        },
        overview: {
          postsTotal: 'Total Posts',
          comments: 'Comments',
          activeUsers: 'Active Users',
          growth: 'Growth',
          growthTrend: 'Increasing',
          welcomeTitle: 'Welcome,',
          welcomeBody: 'This is your comprehensive management panel. You can manage posts, users, roles, permissions, comments and files from a single place safely and efficiently.'
        },
        postForm: {
          titleLabel: 'Title',
          contentLabel: 'Content',
          imageUrlLabel: 'Image URL (Optional)',
          imageFilenameLabel: 'Image Filename (Optional)',
          categoryIdLabel: 'Category ID (Optional)',
          categoryNameLabel: 'Category Name (Optional)',
          titlePlaceholder: 'E.g.: My first post',
          contentPlaceholder: 'Write the post content...',
          imageUrlPlaceholder: 'E.g.: http://localhost:9000/posts/image.jpg',
          imageFilenamePlaceholder: 'E.g.: 1718000000000-photo.jpg',
          categoryIdPlaceholder: 'E.g.: 507f1f77bcf86cd799439011',
          categoryNamePlaceholder: 'E.g.: Backend',
          updatePost: 'Update Post',
          createPost: 'Create Post',
          cancel: 'Cancel',
          characters: 'characters'
        },
        userForm: {
          nameLabel: 'First Name',
          lastnameLabel: 'Last Name',
          usernameLabel: 'Username',
          emailLabel: 'Email',
          passwordLabel: 'Password',
          typeLabel: 'User Type',
          namePlaceholder: 'E.g.: John',
          lastnamePlaceholder: 'E.g.: Doe',
          usernamePlaceholder: 'E.g.: john.doe',
          emailPlaceholder: 'E.g.: john@example.com',
          passwordPlaceholder: 'Minimum 6 characters',
          selectType: 'Select type...',
          updateUser: 'Update User',
          createUser: 'Create User',
          cancel: 'Cancel'
        },
        roleForm: {
          nameLabel: 'Role Name',
          permissionsLabel: 'Assigned Permissions',
          namePlaceholder: 'E.g.: Administrator',
          loadingPermissions: 'Loading permissions...',
          selectedCount: 'permissions selected',
          updateRole: 'Update Role',
          createRole: 'Create Role',
          cancel: 'Cancel'
        },
        permissionForm: {
          nameLabel: 'Permission Name',
          typeLabel: 'Permission Category',
          namePlaceholder: 'E.g.: Create User',
          selectCategory: 'Select category...',
          availableTypes: 'Available types:',
          updatePermission: 'Update Permission',
          createPermission: 'Create Permission',
          cancel: 'Cancel'
        },
        rolePermissions: {
          title: 'Assign Permissions',
          roleLabel: 'Role:',
          selectAll: 'All',
          deselectAll: 'None',
          noPermissions: 'No permissions available',
          savePermissions: 'Save Permissions',
          cancel: 'Cancel'
        }
      },
      client: {
        profile: {
          title: 'My Profile',
          personal_info: 'Personal Information',
          change_password: 'Change Password',
          account_info: 'Account Information',
          update_success: 'Profile updated successfully',
          update_error: 'Error updating profile',
          password_success: 'Password changed successfully',
          password_error: 'Error changing password',
          loading: 'Loading profile...',
          loadError: 'Error loading profile'
        },
        my_posts: {
          title: 'My Posts',
          empty: 'You have no posts yet.',
          create_button: 'Create Post',
          cancel_button: 'Cancel',
          loading: 'Loading...',
          pagination_previous: '← Previous',
          pagination_next: 'Next →'
        },
        my_comments: {
          title: 'My Comments',
          empty: 'You have no comments yet.',
          loading: 'Loading...',
          delete_confirm: 'Are you sure you want to delete this comment?'
        },
        my_favorites: {
          title: 'My Favorites',
          empty: 'You have no favorites yet.',
          loading: 'Loading...',
          pagination_previous: '← Previous',
          pagination_next: 'Next →',
          load_error: 'Error loading favorites.',
          remove_error: 'Error removing favorite.'
        },
        post_form: {
          create_title: 'Create Post',
          update_title: 'Edit Post',
          title_label: 'Title',
          body_label: 'Content',
          category_label: 'Category',
          create_button: 'Create',
          update_button: 'Update',
          cancel_button: 'Cancel'
        },
        validation: {
          post_title_min: 'Title must be at least 3 characters',
          post_body_min: 'Content must be at least 10 characters',
          password_min: 'Password must be at least 8 characters',
          password_mismatch: 'Passwords do not match',
          name_required: 'Name is required',
          email_required: 'Email is required'
        },
        nav: {
          myPosts: 'My posts',
          myFavorites: 'My favorites',
          myComments: 'My comments',
          myProfile: 'My profile'
        },
        postCard: {
          by: 'By',
          view: 'View',
          edit: 'Edit',
          delete: 'Delete'
        },
        commentCard: {
          delete: 'Delete',
          viewPost: 'View post'
        },
        postForm: {
          saving: 'Saving...'
        },
        myComments: {
          loadError: 'Error loading comments',
          deleteError: 'Error deleting comment'
        },
        myPosts: {
          loadError: 'Error loading posts',
          updateError: 'Error updating post',
          createError: 'Error creating post',
          deleteError: 'Error deleting post',
          deleteConfirm: 'Are you sure you want to delete this post?'
        },
        messages: {
          loadError: 'Error loading data',
          deleteError: 'Error deleting item',
          deleted: 'Deleted successfully',
          updated: 'Updated successfully',
          updateError: 'Error updating item',
          created: 'Created successfully',
          createError: 'Error creating item'
        }
      },
      home: {
        header: {
          logoAlt: 'Albatros home',
          logout: 'Logout',
          signIn: 'Sign in',
          register: 'Register'
        },
        hero: {
          title: 'Discover',
          subtitle: 'Explore posts, join the conversation, and share your ideas.',
          ctaAuthenticated: 'Create Post',
          ctaGuest: 'Sign in to Comment'
        },
        search: {
          placeholder: 'Search posts...'
        },
        empty: {
          search: 'No posts match your search.',
          posts: 'No posts yet.',
          loadError: 'Failed to load posts.'
        },
        postCard: {
          by: 'by'
        },
        retry: 'Retry',
        categories: 'Categories',
        allPosts: 'All Posts',
        featuredUsers: 'Featured Users',
        noUsers: 'No featured users',
        about: 'About',
        aboutText: 'Welcome to our community! Explore posts, join discussions, and connect with others who share your interests.'
      },
      posts: {
        postCard: {
          deleteConfirm: 'Are you sure you want to delete this post?'
        },
        list: {
          title: 'Posts',
          newPost: 'New Post',
          loading: 'Loading posts...',
          error: 'Error loading posts',
          empty: 'No posts found.',
          backToPosts: '← Back to Posts'
        },
        detail: {
          loading: 'Loading post...',
          error: 'Error loading post',
          published: 'Published',
          views: 'Views',
          tags: 'Tags',
          commentsTitle: 'Comments',
          commentsLoading: 'Loading comments...',
          commentsError: 'Failed to load comments',
          commentsEmpty: 'No comments yet. Be the first to comment!'
        },
        form: {
          createTitle: 'Create New Post',
          editTitle: 'Edit Post',
          titleLabel: 'Title',
          titlePlaceholder: 'Post title...',
          contentLabel: 'Content',
          contentPlaceholder: 'Post content...',
          statusLabel: 'Status',
          statusDefault: 'No status (draft)',
          tagsLabel: 'Tags (comma-separated)',
          tagsPlaceholder: 'tag1, tag2, tag3...',
          save: 'Save Post',
          saving: 'Saving...',
          cancel: 'Cancel'
        },
        card: {
          by: 'By',
          date: 'Date',
          comments: 'Comments',
          view: 'View',
          edit: 'Edit',
          publish: 'Publish',
          archive: 'Archive',
          delete: 'Delete',
          save: 'Save',
          saved: 'Saved'
        },
        filter: {
          searchLabel: 'Search',
          searchPlaceholder: 'Search by title, content, or author...',
          authorLabel: 'Author',
          authorPlaceholder: 'Filter by author...',
          statusLabel: 'Status',
          allStatuses: 'All Statuses',
          tagsLabel: 'Tags (comma-separated)',
          tagsPlaceholder: 'angular, nestjs...',
          fromDate: 'From Date',
          toDate: 'To Date',
          resetFilters: 'Reset Filters'
        },
        comment: {
          label: 'Comment',
          placeholder: 'Add a comment...',
          submit: 'Submit',
          submitting: 'Submitting...',
          cancel: 'Cancel',
          signInGate: 'Sign in to comment'
        },
        reaction: {
          signInTitle: 'Sign in to react',
          signInBody: 'You must be signed in to leave a reaction.',
          signInBtn: 'Sign In',
          registerBtn: 'Register',
          cancelBtn: 'Cancel'
        },
        comments: {
          anonymous: 'Anonymous',
          reply: 'Reply',
          cancelReply: 'Cancel Reply',
          loadingReplies: 'Loading replies...',
          hideReplies: 'Hide Replies',
          showReplies: 'Show Replies',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save',
          cancel: 'Cancel',
          deleting: 'Deleting...'
        },
        reply: {
          placeholder: 'Reply to comment...',
          submit: 'Reply',
          submitting: 'Replying...',
          cancel: 'Cancel',
          loaded: 'Replies loaded',
          error: 'Error loading replies',
        },
        bulk: {
          title: 'Bulk Upload Posts',
          chooseFile: 'Choose JSON File',
          upload: 'Upload Posts',
          uploading: 'Uploading...',
          parsedInfo: 'valid post(s) ready'
        },
        pagination: {
          info: 'Page',
          of: 'of',
          total: 'total items',
          previous: '← Previous',
          next: 'Next →'
        }
      },
      profile: {
        info: {
          title: 'Profile Information',
          firstName: 'First Name',
          lastName: 'Last Name',
          bio: 'Bio',
          language: 'Language',
          save: 'Save Changes',
          saving: 'Saving...'
        },
        password: {
          title: 'Change Password',
          current: 'Current Password',
          new: 'New Password',
          confirm: 'Confirm Password',
          change: 'Change Password',
          changing: 'Changing...',
          minLength: 'Password must be at least 8 characters',
          mismatch: 'Passwords do not match'
        },
        account: {
          title: 'Account Details',
          username: 'Username',
          email: 'Email',
          status: 'Status',
          verified: 'Verified',
          notVerified: 'Not verified',
          active: 'Active',
          inactive: 'Inactive',
          memberSince: 'Member Since',
          lastLogin: 'Last Login',
          userId: 'User ID'
        },
        noPermission: 'You do not have permission to edit this profile',
        personalInfo: 'Personal Information',
        name: 'Name',
        lastname: 'Last name',
        email: 'Email'
      },
      navigation: {
        menu: 'Menu',
        feed: 'Feed',
        myPosts: 'My Posts',
        myFavorites: 'My Favorites',
        myComments: 'My Comments',
        myProfile: 'My Profile',
        backHome: 'Back to Home'
      },
      feed: {
        description: 'Explore community posts and participate',
        empty: 'No posts available at this moment'
      },
      activity: {
        recentActivity: 'Recent Activity',
        noActivity: 'No recent activity'
      },
      stats: {
        yourStats: 'Your Stats',
        posts: 'Posts',
        comments: 'Comments',
        favorites: 'Favorites'
      },
      trending: {
        trending: 'Trending'
      }
    }
  };

  get language$(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  get currentLanguage(): Language {
    return this.currentLanguage$.getValue();
  }

  setLanguage(lang: Language): void {
    this.currentLanguage$.next(lang);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('app-language', lang);
    }
  }

  translate(key: string, fallback: string = ''): string {
    const keys = key.split('.');
    let value: TranslationMap | string | undefined = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value === 'string') {
      return value;
    }
    return fallback || key;
  }

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('app-language') as Language;
      if (savedLang) {
        this.currentLanguage$.next(savedLang);
      }
    }
  }
}
