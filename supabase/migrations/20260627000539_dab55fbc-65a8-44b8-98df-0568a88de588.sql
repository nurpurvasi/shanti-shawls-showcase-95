
CREATE POLICY "Public read shanti-media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'shanti-media');
CREATE POLICY "Admins write shanti-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shanti-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update shanti-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'shanti-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete shanti-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shanti-media' AND public.has_role(auth.uid(),'admin'));
