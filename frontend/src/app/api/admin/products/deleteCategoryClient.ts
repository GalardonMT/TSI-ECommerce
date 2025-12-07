export async function deleteCategory(id: number | string) {
  try {
    const response = await fetch(`/api/admin/products/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const text = await response.text();
    let payload: any = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (parseError) {
        payload = { detail: text };
      }
    }

    if (!response.ok) {
      throw new Error(payload?.detail || "Error eliminando la categoría");
    }

    return payload || { ok: true };
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    return null;
  }
}
