import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const SyncUser = async() => {

  const {userId }=  await auth()

  if(!userId) {
    throw new Error('User notfound')
  }
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  //this will return the user fiorstname and lastname and email

  if(!user.emailAddresses[0]?.emailAddress)
  {
    throw new Error('User email notfound')
  }

  await db.user.upsert({
    where: { emailAddress: user.emailAddresses[0]?.emailAddress?? ''},
    update: {
      imageUrl:user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses[0]?.emailAddress?? ''
    },
    create: {
      id:userId,
      imageUrl:user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses[0]?.emailAddress?? ''
    }
  })
  return (
    redirect('/dashboard')
  )
}

export default SyncUser