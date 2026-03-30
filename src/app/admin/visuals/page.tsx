"use client";

import { VisualsManager } from "@/components/admin/visuals-manager";

export default function AdminVisualsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Plataformas y Géneros</h1>
                <p className="text-muted-foreground">Administra las etiquetas visuales para los productos.</p>
            </div>

            {/* VisualsManager already contains the Card and Tabs UI, so we just render it here.
          We might want to refactor VisualsManager later to be less "cardy" if wrapped here, 
          but for now it's fine. */}
            <VisualsManager />
        </div>
    );
}
