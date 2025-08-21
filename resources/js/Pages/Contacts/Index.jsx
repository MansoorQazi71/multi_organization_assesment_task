import React from 'react';

const ContactList = ({ contacts }) => {
  return (
    <div className="container mx-auto">
      <h1 className="text-xl">Contacts</h1>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Avatar</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td>{contact.first_name} {contact.last_name}</td>
              <td>{contact.email}</td>
              <td>{contact.phone}</td>
              <td><img src={contact.avatar_path} alt="Avatar" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;
