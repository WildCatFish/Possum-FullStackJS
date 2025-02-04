// accept users as a parameter and do something
import { ID } from 'appwrite'
import { INewUser } from '@/types'
import { account, appwriteConfig, avatars, databases } from './config'
import { Query } from '@tanstack/react-query'

export async function createUserAccount (user: INewUser) {
  try {
    const newAccount = await account.create(
      // generate unique id
      ID.unique(),
      user.email,
      user.password,
      user.name
    )

    if (!newAccount) throw Error

    const avatarUrl = avatars.getInitials(user.name)

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl
    })

    return newUser
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function saveUserToDB (user: {
  accountId: string
  email: string
  name: string
  imageUrl: URL
  username?: string
}) {
  // save to appwrite database
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    )
    return newUser
  } catch (error) {
    console.log(error)
  }
}

export async function SignInAccount (user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password)
    return session
  } catch (error) {
    console.log(error)
  }
}

export async function getCurrentUser () {
  try {
    const currentAccount = await account.get()
    if (!currentAccount) throw Error

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error

    return currentUser.documents[0]
  } catch (error) {
    console.log(error)
  }
}
