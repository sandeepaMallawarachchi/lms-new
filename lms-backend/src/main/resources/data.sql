-- Insert Courses
INSERT INTO courses (id, title, description, duration_in_weeks, fee, number_of_modules, total_chapters, free_chapters, active, is_published, thumbnail_url)
VALUES 
(1, 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.', 8, 299.00, 2, 5, 2, true, true, 'https://example.com/web-dev-thumb.jpg'),
(2, 'Advanced React & Next.js', 'Master React hooks, context API, and server-side rendering with Next.js.', 10, 399.00, 1, 2, 1, true, true, 'https://example.com/react-thumb.jpg'),
(3, 'UI/UX Design Fundamentals', 'Learn design principles, wireframing, prototyping, and user research.', 6, 249.00, 1, 1, 1, true, true, 'https://example.com/uiux-thumb.jpg'),
(4, 'Full-Stack JavaScript', 'Build complete applications with Node.js, Express, MongoDB, and React.', 12, 499.00, 1, 1, 1, true, true, 'https://example.com/fullstack-thumb.jpg'),
(5, 'Data Science Essentials', 'Introduction to Python, data analysis, visualization, and machine learning.', 10, 399.00, 1, 1, 1, true, true, 'https://example.com/data-science-thumb.jpg'),
(6, 'Mobile App Development', 'Create cross-platform mobile apps using React Native and Expo.', 8, 349.00, 1, 1, 1, true, true, 'https://example.com/mobile-dev-thumb.jpg');

-- Insert Modules
INSERT INTO modules (id, title, description, course_id, order_index)
VALUES 
-- Web Development Course Modules
(1, 'HTML Fundamentals', 'Learn the building blocks of web pages', 1, 1),
(2, 'CSS Styling', 'Style your web pages with CSS', 1, 2),
-- React Course Module
(3, 'React Fundamentals', 'Learn the core concepts of React', 2, 1),
-- UI/UX Course Module
(4, 'Design Principles', 'Learn fundamental design principles', 3, 1),
-- Full-Stack Course Module
(5, 'Node.js Basics', 'Learn server-side JavaScript with Node.js', 4, 1),
-- Data Science Course Module
(6, 'Python for Data Science', 'Learn Python programming for data analysis', 5, 1),
-- Mobile App Development Module
(7, 'React Native Fundamentals', 'Learn the basics of React Native', 6, 1);

-- Insert Chapters
INSERT INTO chapters (id, title, description, module_id, order_index, is_free, is_video_content, video_url, content)
VALUES 
-- HTML Fundamentals Chapters
(1, 'Introduction to HTML', 'Understanding the basics of HTML markup', 1, 1, true, true, 'https://www.youtube.com/watch?v=UB1O30fR-EE', 'HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser...'),
(2, 'HTML Elements and Attributes', 'Working with HTML elements and their attributes', 1, 2, true, false, NULL, 'HTML elements are represented by tags. Tags are enclosed in angle brackets...'),
(3, 'HTML Forms', 'Creating interactive forms with HTML', 1, 3, false, false, NULL, 'HTML forms are used to collect user input. The form element defines a form that is used to collect user input...'),

-- CSS Styling Chapters
(4, 'Introduction to CSS', 'Learn the basics of CSS styling', 2, 1, false, true, 'https://www.youtube.com/watch?v=1PnVor36_40', 'CSS (Cascading Style Sheets) is used to style and layout web pages...'),
(5, 'CSS Selectors', 'Target HTML elements with CSS selectors', 2, 2, false, false, NULL, 'CSS selectors are used to ''find'' (or select) the HTML elements you want to style...'),

-- React Fundamentals Chapters
(6, 'Introduction to React', 'Understanding the basics of React', 3, 1, true, true, 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 'React is a JavaScript library for building user interfaces...'),
(7, 'Components and Props', 'Working with React components and props', 3, 2, false, false, NULL, 'Components let you split the UI into independent, reusable pieces...'),

-- Design Principles Chapter
(8, 'Introduction to UI/UX', 'Understanding the basics of UI/UX design', 4, 1, true, false, NULL, 'UI/UX design focuses on creating meaningful and relevant experiences for users...'),

-- Node.js Basics Chapter
(9, 'Introduction to Node.js', 'Getting started with Node.js', 5, 1, true, false, NULL, 'Node.js is a JavaScript runtime built on Chrome''s V8 JavaScript engine...'),

-- Python for Data Science Chapter
(10, 'Python Basics', 'Getting started with Python', 6, 1, true, false, NULL, 'Python is a high-level, interpreted programming language...'),

-- React Native Chapter
(11, 'Introduction to React Native', 'Getting started with React Native', 7, 1, true, false, NULL, 'React Native is a framework for building native apps using React...');

-- Insert Documents
INSERT INTO documents (file_name, file_path, file_type, file_size, chapter_id)
VALUES 
('html-basics.pdf', '/documents/html-basics.pdf', 'application/pdf', 1258291, 1),
('html-forms-guide.pdf', '/documents/html-forms-guide.pdf', 'application/pdf', 2516582, 3),
('react-intro.pdf', '/documents/react-intro.pdf', 'application/pdf', 3251149, 6); 