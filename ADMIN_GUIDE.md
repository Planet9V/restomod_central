# Premium Automotive Platform - Administrator Guide

This guide outlines the features and responsibilities available to users with administrator privileges.

## Gaining Admin Access

Admin access is granted by setting the `is_admin` flag to `true` for a user account directly in the database. During initial setup, the first user created (`jims67mustang@gmail.com`) is automatically designated as an administrator.

## Admin Dashboard

Authenticated administrators have access to a special **Admin Dashboard**. A link to this dashboard will appear in the main navigation menu when an admin is logged in.

The Admin Dashboard provides access to content management features.

## Content Management

As an administrator, you have the ability to perform Create, Read, Update, and Delete (CRUD) operations on most of the platform's data. This is typically done via protected API endpoints.

### Protected API Routes

Several API routes are protected and require both authentication and administrator privileges. These routes are prefixed with `/api/admin/`. They allow for the management of:

-   Projects
-   Testimonials
-   Team Members
-   Company Information
-   Luxury Showcases
-   Research Articles
-   Car Show Events

Managing this data requires using an API client or a dedicated admin interface (which can be built out from the Admin Dashboard).

### Example: Deleting a Project

To delete a project, an admin would need to send an authenticated `DELETE` request to the following endpoint:

`/api/admin/projects/:id`

This ensures that only authorized personnel can modify the core content of the platform.
