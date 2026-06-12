const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('Routes.js') || f === 'accessoriesRoute.js');

const privateRouteRegex = /const PrivateRoute = \(\{ element, roles \}\) => \{[\s\S]*?return element;\s*\n\};\s*\n\s*const applyPrivateRoute = \(route\) => \(\{\s*\.\.\.route,\s*element: <PrivateRoute element=\{route\.element\} roles=\{route\.roles\} \/>,\s*\}\);/g;

const newPrivateRoute = `import { canViewRoute } from "../utils/rbacUtils";

const PrivateRoute = ({ element, roles, path }) => {
  const myDecipher = decipherEncryption('skytrack')
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item => myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated');
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  
  const permissions = (() => {
    try {
      const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (path && userRoles) {
    const canAccess = canViewRoute(path, userRoles, permissions, roles);
    if (!canAccess) {
      return <NotAuthorized />;
    }
  } else if (roles && roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    return <NotAuthorized />;
  }
  
  return element;
};

const applyPrivateRoute = (route, basePath = "") => {
  const fullPath = route.path ? (basePath + "/" + route.path).replace(/\\/+/g, '/') : basePath;
  return {
    ...route,
    element: <PrivateRoute element={route.element} roles={route.roles} path={fullPath} />,
  };
};`;

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('const PrivateRoute')) {
    // We need to add the import if it's not there
    if (!content.includes('import { canViewRoute }')) {
      // Replace the PrivateRoute block
      // But we can't just use the regex because the regex includes the import in the replacement
      // Let's manually replace
      
      const startIndex = content.indexOf('const PrivateRoute = ({ element, roles }) => {');
      const endIndexStr = 'element: <PrivateRoute element={route.element} roles={route.roles} />,\n});';
      let endIndex = content.indexOf(endIndexStr);
      
      if (startIndex !== -1 && endIndex !== -1) {
        endIndex += endIndexStr.length;
        
        let before = content.substring(0, startIndex);
        let after = content.substring(endIndex);
        
        // Find last import
        const lastImportIndex = before.lastIndexOf('import ');
        const nextLineAfterImport = before.indexOf('\\n', lastImportIndex);
        
        let newContent = before + newPrivateRoute + after;
        
        // Also need to update where applyPrivateRoute is called!
        // Usually it's like: ].map((route) => applyPrivateRoute(route))
        // We need to pass the base path!
        // Wait, base path is hard because we don't know it.
        // What if we just use window.location.pathname inside PrivateRoute?
        
      }
    }
  }
});
