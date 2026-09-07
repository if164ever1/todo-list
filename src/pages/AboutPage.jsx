function AboutPage() {
  return (
    <main>
      <h2>About This App</h2>
      <p>
        This todo app helps users organize tasks, find important work, and keep
        track of completed items.
      </p>

      <section>
        <h3>Features</h3>
        <ul>
          <li>Add, edit, and complete todos</li>
          <li>Search todos by title</li>
          <li>Sort todos by creation date or title</li>
          <li>Secure access through user authentication</li>
        </ul>
      </section>

      <section>
        <h3>Technologies Used</h3>
        <ul>
          <li>React</li>
          <li>React Router</li>
          <li>Vite</li>
        </ul>
      </section>
    </main>
  );
}

export default AboutPage;
