const BASE_URL = "http://localhost:4000/issues";

export const getAllIssues = async () => {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch issues");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updateIssueStatus = async (id, status) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};
