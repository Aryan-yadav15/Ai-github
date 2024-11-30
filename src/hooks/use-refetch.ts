import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

type Props = {}


//this qill  invaldate the query by the use-project hook and it will do a fresh fetch
const UseRefetch = () => {
  const queryClient = useQueryClient()
  return async()=>{
    await queryClient.refetchQueries(
        {
            type:"active"
        }
    )
  }
}

export default UseRefetch