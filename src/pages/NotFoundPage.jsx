import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main>
      <h2>404: Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <nav aria-label="404 recovery navigation">
        <ul>
          <li>
            <Link to="/">Go home</Link>
          </li>
          <li>
            <Link to="/todos">View todos</Link>
          </li>
          <li>
            <Link to="/about">About this app</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default NotFoundPage;
