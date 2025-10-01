import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // Extraer datos del formulario
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      team: formData.get('team') as string,
      service: formData.get('service') as string,
      message: formData.get('message') as string,
      created_at: new Date().toISOString()
    };

    // Procesar imágenes adjuntas
    const images: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        try {
          // Subir imagen a Supabase Storage
          const fileName = `contact-${Date.now()}-${value.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('contact-images')
            .upload(fileName, value);

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
          }

          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('contact-images')
            .getPublicUrl(fileName);

          images.push(publicUrl);
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    // Guardar en base de datos
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        ...contactData,
        images: images.length > 0 ? images : null
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Error saving message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Enviar email de notificación
    // Aquí podrías integrar con un servicio de email como SendGrid, Resend, etc.

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};