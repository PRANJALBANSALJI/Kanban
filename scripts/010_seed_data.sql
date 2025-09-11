-- Insert default board for demo purposes
-- This will only work after a user signs up and confirms their email

-- Note: This seed data will be inserted by the application after user authentication
-- since RLS policies require authenticated users

-- Example structure for reference:
-- INSERT INTO public.boards (title, description, owner_id) 
-- VALUES ('My First Board', 'Welcome to your Kanban board!', auth.uid());

-- INSERT INTO public.columns (board_id, title, position) 
-- VALUES 
--   ((SELECT id FROM public.boards WHERE title = 'My First Board' LIMIT 1), 'To Do', 0),
--   ((SELECT id FROM public.boards WHERE title = 'My First Board' LIMIT 1), 'In Progress', 1),
--   ((SELECT id FROM public.boards WHERE title = 'My First Board' LIMIT 1), 'Done', 2);

-- This seed data will be handled by the application logic instead
