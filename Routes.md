1.User (/api/auth)

route -> Post :- /signup => user signup

route -> Post :- /login => user login

route -> Post :- /forgot-password => user forgot password

route -> Post :- /reset-password/:token =>user reset password with reset token

route -> Get :- /profile =>user profile

route -> Put :- /profile =>user profile update

route -> Post :- /logout =>user logout

2.Tracking (/api/track)

route -> Get :- /:trackingNumber => track the shipment or the order

3.Events (/api/events)

route -> Post :- /create-event => creates a event by superadmin \& employer

route -> Get :- /available-events => views available events

route -> Get :- /employer-events/:eventid => views events created by employer

route -> Put :- /employer-events/:eventid => updates events created by employer

route -> Delete :- /employer-events/:eventid => deletes events created by employer

route -> Get :- /all-events => views all events

route -> Put :- /all-events/:eventTd => updates events

route -> Delete :- /all-events/:eventTd => deletes events

4.Registrations (/api/registrations)

route -> Post :- /register/:eventId => user can register for event using event id

route -> Get :- /myregistrations => user can see his registrations

route -> Delete :- /myregistrations/:registrationId => user can cancel his registrations using registration id

route -> Get :- /employer-registrations/:eventId => Employer can see registrations of his events

route -> Get :- /all-registrations => Admin and superadmin is able to view all registrations across all events

route -> Put :- /all-registrations/:registrationId => superadmin Can update any registrations even if not created by them

route -> Delete :- /all-registrations/:registrationId => superadmin Can delete any registrations even if not created by them

5.Analytics (/api/analytics)

route -> Get :- /overview =>Provides total users, events, registrations, and top 5 events by registration count for superadmin to get analytics

route -> Get :- /activity =>Route to get recent activity for the last 7 days This route provides counts of new users, events, and registrations created in the last 7 days

6. Superadmin (/api/superadmin)

route -> Post :- /create-user =>Create user (admin/employer/user only)

route -> Put :- /update-user/:UserId =>Updates user by ID

route -> Delete :- /delete-user/:UserId =>delete user by ID

route -> Put :- /change-role/:UserId =>the admin and superadmin can change the user roles but not to superadmin
