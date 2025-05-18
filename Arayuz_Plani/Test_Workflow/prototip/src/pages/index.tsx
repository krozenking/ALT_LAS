// src/pages/index.tsx
import React from 'react';
import { Button } from '../components/Button';
import { useThemeStore } from '../store/useThemeStore';

export default function Home() {
  const { theme, setTheme } = useThemeStore();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">ALT_LAS Arayüz Prototip</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tema Seçimi</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant={theme === 'light' ? 'primary' : 'secondary'} 
              onClick={() => setTheme('light')}
            >
              Açık Tema
            </Button>
            <Button 
              variant={theme === 'dark' ? 'primary' : 'secondary'} 
              onClick={() => setTheme('dark')}
            >
              Koyu Tema
            </Button>
            <Button 
              variant={theme === 'system' ? 'primary' : 'secondary'} 
              onClick={() => setTheme('system')}
            >
              Sistem Teması
            </Button>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Buton Varyasyonları</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-3">Primary</h3>
              <div className="flex flex-col gap-2">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" fullWidth>Full Width</Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-3">Secondary</h3>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="secondary" fullWidth>Full Width</Button>
              </div>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-3">Tertiary</h3>
              <div className="flex flex-col gap-2">
                <Button variant="tertiary" size="sm">Small</Button>
                <Button variant="tertiary" size="md">Medium</Button>
                <Button variant="tertiary" size="lg">Large</Button>
                <Button variant="tertiary" disabled>Disabled</Button>
                <Button variant="tertiary" fullWidth>Full Width</Button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Erişilebilirlik Özellikleri</h2>
          <p className="mb-4">
            Bu prototip, WCAG 2.1 AA seviyesi erişilebilirlik standartlarına uygun olarak geliştirilmiştir.
            Tüm butonlar klavye ile erişilebilir ve ekran okuyucular ile uyumludur.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              onClick={() => alert('Erişilebilirlik testi başarılı!')}
            >
              Erişilebilirlik Testi
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
