export default function Message(props) {
    let bg;
    if (props.sent === true)
        bg = "bg-success text-white";
    else
        bg = "bg-primary text-white";
    return (

        <div className={bg + " row px-3 py-2 rounded shadow my-2"}>

            <p className="fw-bold">{props.msg?.from}</p>
            <p>{props.msg?.text}</p>
            <small>(Received by server at {props.msg?.dateTime})</small>
        </div>
    )
}