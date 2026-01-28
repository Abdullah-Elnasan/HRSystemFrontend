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
      primary: 'green',
      neutral: 'slate'
    },
    table: {
      slots: {
        base: 'min-w-full table-fixed border-separate border-spacing-y-1 px-1',
        tbody: 'isolate',
        thead: 'shadow-sm ring-1 ring-default/10 rounded-lg transition-shadow',
        tr: 'data-[selected=true]:bg-elevated/50',
        separator:'',
        td: `
      p-4 text-sm text-muted whitespace-nowrap
      first:rounded-r-lg
      last:rounded-l-lg
    `
      }

    },

    dashboardPanel: {

      slots: {
        body: 'pt-4 pb-0 sm:pt-4 sm:pb-0',
      }
    }
  }
})
