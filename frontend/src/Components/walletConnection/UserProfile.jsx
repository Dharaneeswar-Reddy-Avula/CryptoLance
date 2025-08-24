import { useState, useEffect } from "react";

function UserProfile({ token, userExists, user, address, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    userWallet: address || "",
    username: user?.username || "",
    email: user?.email || "",
    rating: user?.rating || 0,
    gigs: user?.gigs || [],
    experience: user?.experience || [],
    role: user?.role || "bidder",
  });
  const [newExperience, setNewExperience] = useState({
    title: "",
    timeline: "",
    tags: "",
    role: "",
    company: "",
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        userWallet: address,
        username: user.username,
        email: user.email,
        rating: user.rating,
        gigs: user.gigs,
        experience: user.experience,
        role: user.role,
      });
    }
  }, [user, address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewExperience((prev) => ({ ...prev, [name]: value }));
  };

  const addExperience = () => {
    const tagsArray = newExperience.tags
      ? newExperience.tags.split(",").map((tag) => tag.trim())
      : [];
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...newExperience, tags: tagsArray }],
    }));
    setNewExperience({
      title: "",
      timeline: "",
      tags: "",
      role: "",
      company: "",
    });
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = userExists
        ? `https://cryptolance-qgzz.onrender.com/api/users/${user._id}`
        : "https://cryptolance-qgzz.onrender.com/api/users";
      const method = userExists ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok) {
        setStatus(userExists ? "Profile updated" : "Profile created");
        onProfileUpdate(result);
      } else {
        setStatus(result.message || "Error saving profile");
      }
    } catch (error) {
      console.error("Profile error:", error);
      setStatus("Error saving profile");
    }
  };

  if (!token) return null;

  return (
    <div>
      <h2>{userExists ? "Update Profile" : "Create Profile"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="bidder">Bidder</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <h3>Add Experience</h3>
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={newExperience.title}
            onChange={handleExperienceChange}
            required
          />
        </div>
        <div>
          <label>Timeline:</label>
          <input
            type="text"
            name="timeline"
            value={newExperience.timeline}
            onChange={handleExperienceChange}
          />
        </div>
        <div>
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            name="tags"
            value={newExperience.tags}
            onChange={handleExperienceChange}
          />
        </div>
        <div>
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={newExperience.role}
            onChange={handleExperienceChange}
          />
        </div>
        <div>
          <label>Company:</label>
          <input
            type="text"
            name="company"
            value={newExperience.company}
            onChange={handleExperienceChange}
          />
        </div>
        <button type="button" onClick={addExperience}>
          Add Experience
        </button>
        <h3>Current Experiences</h3>
        <ul>
          {formData.experience.map((exp, index) => (
            <li key={index}>
              {exp.title} ({exp.timeline}) - {exp.role} at {exp.company} [Tags:{" "}
              {exp.tags.join(", ")}]
              <button type="button" onClick={() => removeExperience(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="submit">
          {userExists ? "Update" : "Create"} Profile
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default UserProfile;
