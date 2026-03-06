export default defineAppConfig({
  ui: {
    dashboardGroup: {
      base: '',
    },
    dashboardSidebar: {
      slots: {
        header: 'border-b border-default',
      },
      variants: {
        side: {
          right: {
            root: 'border-s border-default'
          }
        },
      }
    },
    colors: {
      primary: 'primary',
      neutral: 'slate',
      secondary: 'secondary'
    },
    table: {
      slots: {
        base: 'min-w-full table-fixed border-separate border-spacing-y-1 px-1',
        tbody: 'isolate',
        thead: 'text-center shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
        tr: 'data-[selected=true]:bg-elevated/50 ',
        separator: 'bg-transparent',
        td: `
      p-4 text-sm text-muted text-center whitespace-nowrap
      first:rounded-r-lg
      last:rounded-l-lg`
      },
      th:'text-center'

    },

    dashboardPanel: {

      slots: {
        body: 'pt-2 pb-0 sm:pt-2 sm:pb-0',
      }
    },
    pagination: {
      slots: {
        root: '',
        list: 'flex items-center gap-1',
        ellipsis: 'pointer-events-none',
        label: 'text-center',
        // first: 'w-7 h-7 flex items-center justify-center ',
        // prev: 'w-7 h-7 flex items-center justify-center ',
        item: ' pt-2',
        // next: 'w-7 h-7 flex items-center justify-center ',
        // last: 'w-7 h-7 flex items-center justify-center '
      }
    }
  }
})
