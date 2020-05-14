db.createUser({
  user: "user",
  roles: [ { role: "dbOwner", db: "research" } ]
})

db.users.insert({
  name: "user"
})