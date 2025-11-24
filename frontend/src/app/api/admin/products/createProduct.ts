export async function createProduct(formData: FormData) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Build JSON payload. If images are present in FormData (key 'image' or 'images'), convert them to data URLs.
    const getFilesFromForm = (fd: FormData): File[] => {
        const out: File[] = [];
        for (const pair of fd.entries()) {
            const [key, value] = pair as [string, any];
            if (value instanceof File) out.push(value);
            // handle arrays of files if appended with same key
        }
        return out;
    };

    const files = getFilesFromForm(formData);

    const fileToDataUrl = (f: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(f);
        });

    const imagenes: Array<{ image: string; orden?: number }> = [];
    try {
        for (const f of files) {
            const data = await fileToDataUrl(f);
            imagenes.push({ image: data, orden: 0 });
        }
    } catch (err) {
        console.error('Error converting files to data URLs', err);
    }

    const body = {
        categoria: formData.get("categoria") ? Number(formData.get("categoria")) : null,
        nombre: formData.get("nombre"),
        descripcion: formData.get("descripcion"),
        precio: Number(formData.get("precio")),
        stock_disponible: Number(formData.get("stock_disponible")) || 0,
        imagenes,
    };

    try {
        const res = await fetch(`${API_URL}/api/inventario/producto/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error(await res.text());
            throw new Error("Error creando el producto");
        }

        return await res.json();
    } catch (error) {
        console.error("Error creando producto:", error);
        return null;
    }
}
