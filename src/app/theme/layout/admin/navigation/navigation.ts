import { PrivilegeService } from 'src/app/services/roles/get-roles-service';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}

export function getNavigationItems(privilege: PrivilegeService): NavigationItem[] {
  return [
    {
      id: 'navigation',
      title: 'navBar.navigate',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'navBar.dashboard',
          type: 'item',
          url: '/dashboard',
          icon: 'feather icon-home',
          classes: 'nav-item'
        }
      ]
    },

    {
      id: 'gestions',
      title: 'navBar.management',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'categories',
          title: 'navBar.categories',
          type: 'item',
          url: '/categories/index',
          icon: 'feather icon-grid',
          classes: 'nav-item',
          hidden: !privilege.getPrivilege(['admin', 'article'])
        },
        {
          id: 'articles',
          title: 'navBar.articles',
          type: 'item',
          url: '/articles/index',
          icon: 'feather icon-package',
          classes: 'nav-item',
          hidden: !privilege.getPrivilege(['admin', 'article'])
        },
        {
          id: 'articles-create',
          title: 'navBar.article-title',
          type: 'item',
          url: '/articles/create',
          icon: 'feather icon-plus',
          classes: 'nav-item',
          breadcrumbs: true,
          hidden: true
        },
        {
          id: 'pharmacies',
          title: 'navBar.pharmacies',
          type: 'item',
          url: '/pharmacy/index',
          classes: 'nav-item',
          icon: 'feather icon-briefcase',
          hidden: !privilege.getPrivilege(['admin', 'pharmacy'])
        },
        {
          id: 'commandes',
          title: 'navBar.commands',
          type: 'item',
          url: '/commands',
          classes: 'nav-item',
          icon: 'feather icon-activity',
          hidden: !privilege.getPrivilege(['admin', 'commande'])
        },
        {
          id: 'listings',
          title: 'navBar.listings',
          type: 'item',
          url: '/listings/index',
          classes: 'nav-item',
          icon: 'feather icon-list',
          hidden: !privilege.getPrivilege(['admin', 'listing'])
        }
      ]
    },
    {
      id: 'administration',
      title: 'navBar.administration',
      type: 'group',
      icon: 'icon-user',
      children: [
        {
          id: 'users',
          title: 'navBar.users',
          type: 'item',
          url: '/users',
          icon: 'feather icon-user',
          classes: 'nav-item',
          hidden: !privilege.getPrivilege(['admin', 'user'])
        }
      ]
    }
  ];
}

// export const NavigationItems: NavigationItem[] = [
//   {
//     id: 'navigation',
//     title: 'Navigation',
//     type: 'group',
//     icon: 'icon-navigation',
//     children: [
//       {
//         id: 'dashboard',
//         title: 'Dashboard',
//         type: 'item',
//         url: '/dashboard',
//         icon: 'feather icon-home',
//         classes: 'nav-item'
//       }
//     ]
//   },
//   {
//     id: 'gestions',
//     title: 'Gestions',
//     type: 'group',
//     icon: 'icon-navigation',
//     children: [
//       {
//         id: 'articles',
//         title: 'Articles',
//         type: 'item',
//         url: '/articles/index',
//         icon: 'feather icon-package',
//         classes: 'nav-item'
//       },
//       {
//         id: 'articles-create',
//         title: 'Créer un article',
//         type: 'item',
//         url: '/articles/create',
//         icon: 'feather icon-plus',
//         classes: 'nav-item',
//         breadcrumbs: true,
//         hidden: true
//       },
//       {
//         id: 'pharmacies',
//         title: 'Pharmacies',
//         type: 'item',
//         url: '/pharmacies',
//         classes: 'nav-item',
//         icon: 'feather icon-briefcase'
//       },
//       {
//         id: 'commandes',
//         title: 'Commandes',
//         type: 'item',
//         url: '/commands',
//         classes: 'nav-item',
//         icon: 'feather icon-activity'
//       },
//       {
//         id: 'listings',
//         title: 'Listings',
//         type: 'item',
//         url: '/listings/index',
//         classes: 'nav-item',
//         icon: 'feather icon-list'
//       }
//     ]
//   },

//   {
//     id: 'administration',
//     title: 'Administration',
//     type: 'group',
//     icon: 'icon-user',
//     children: [
//       {
//         id: 'users',
//         title: 'Users',
//         type: 'item',
//         url: '/users',
//         icon: 'feather icon-user',
//         classes: 'nav-item'
//       }
//     ]
//   }
//   // {
//   //   id: 'ui-element',
//   //   title: 'UI ELEMENT',
//   //   type: 'group',
//   //   icon: 'icon-ui',
//   //   children: [
//   //     {
//   //       id: 'basic',
//   //       title: 'Component',
//   //       type: 'collapse',
//   //       icon: 'feather icon-box',
//   //       children: [
//   //         {
//   //           id: 'button',
//   //           title: 'Button',
//   //           type: 'item',
//   //           url: '/basic/button'
//   //         },
//   //         {
//   //           id: 'badges',
//   //           title: 'Badges',
//   //           type: 'item',
//   //           url: '/basic/badges'
//   //         },
//   //         {
//   //           id: 'breadcrumb-pagination',
//   //           title: 'Breadcrumb & Pagination',
//   //           type: 'item',
//   //           url: '/basic/breadcrumb-paging'
//   //         },
//   //         {
//   //           id: 'collapse',
//   //           title: 'Collapse',
//   //           type: 'item',
//   //           url: '/basic/collapse'
//   //         },
//   //         {
//   //           id: 'tabs-pills',
//   //           title: 'Tabs & Pills',
//   //           type: 'item',
//   //           url: '/basic/tabs-pills'
//   //         },
//   //         {
//   //           id: 'typography',
//   //           title: 'Typography',
//   //           type: 'item',
//   //           url: '/basic/typography'
//   //         }
//   //       ]
//   //     }
//   //   ]
//   // },
//   // {
//   //   id: 'forms',
//   //   title: 'Forms & Tables',
//   //   type: 'group',
//   //   icon: 'icon-group',
//   //   children: [
//   //     {
//   //       id: 'forms-element',
//   //       title: 'Form Elements',
//   //       type: 'item',
//   //       url: '/forms',
//   //       classes: 'nav-item',
//   //       icon: 'feather icon-file-text'
//   //     },
//   //     {
//   //       id: 'tables',
//   //       title: 'Tables',
//   //       type: 'item',
//   //       url: '/tables',
//   //       classes: 'nav-item',
//   //       icon: 'feather icon-server'
//   //     }
//   //   ]
//   // },
//   // {
//   //   id: 'chart-maps',
//   //   title: 'Chart',
//   //   type: 'group',
//   //   icon: 'icon-charts',
//   //   children: [
//   //     {
//   //       id: 'apexChart',
//   //       title: 'ApexChart',
//   //       type: 'item',
//   //       url: 'apexchart',
//   //       classes: 'nav-item',
//   //       icon: 'feather icon-pie-chart'
//   //     }
//   //   ]
//   // },
//   // {
//   //   id: 'pages',
//   //   title: 'Pages',
//   //   type: 'group',
//   //   icon: 'icon-pages',
//   //   children: [
//   //     {
//   //       id: 'auth',
//   //       title: 'Authentication',
//   //       type: 'collapse',
//   //       icon: 'feather icon-lock',
//   //       children: [
//   //         {
//   //           id: 'signup',
//   //           title: 'Sign up',
//   //           type: 'item',
//   //           url: '/register',
//   //           target: false,
//   //           breadcrumbs: false
//   //         },
//   //         {
//   //           id: 'signin',
//   //           title: 'Sign in',
//   //           type: 'item',
//   //           url: '/login',
//   //           target: false,
//   //           breadcrumbs: false
//   //         }
//   //       ]
//   //     },
//   //     {
//   //       id: 'sample-page',
//   //       title: 'Sample Page',
//   //       type: 'item',
//   //       url: '/sample-page',
//   //       classes: 'nav-item',
//   //       icon: 'feather icon-sidebar'
//   //     },
//   //     {
//   //       id: 'disabled-menu',
//   //       title: 'Disabled Menu',
//   //       type: 'item',
//   //       url: 'javascript:',
//   //       classes: 'nav-item disabled',
//   //       icon: 'feather icon-power',
//   //       external: true
//   //     },

//   //   ]
//   // }
// ];
