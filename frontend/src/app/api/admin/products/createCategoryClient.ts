type CreateCategoryPayload = {
  nombre: string;
  descripcion?: string;
};

export async function createCategory(payload: CreateCategoryPayload) {
  try {
    const response = await fetch("/api/admin/products/createCategory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Error creando la categoría");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creando categoría:", error);
    return null;
  }
}
