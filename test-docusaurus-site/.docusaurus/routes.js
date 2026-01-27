import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '024'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'cfb'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '8b1'),
            routes: [
              {
                path: '/plantuml-class-diagrams-en',
                component: ComponentCreator('/plantuml-class-diagrams-en', '0eb'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/plantuml-class-diagrams-nl',
                component: ComponentCreator('/plantuml-class-diagrams-nl', 'ae0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'bea'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
