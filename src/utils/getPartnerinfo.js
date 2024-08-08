const getPartnerinfo=(participants,email)=>{
    return participants.find(participant=>participant.email!==email)
}

export default getPartnerinfo