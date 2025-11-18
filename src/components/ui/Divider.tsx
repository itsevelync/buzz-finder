export default function Divider(props: { text: string }) {
    return (
        <div className="flex gap-3 items-center text-gray-400">
            <hr className="w-full" />
            <p>{props.text}</p>
            <hr className="w-full" />
        </div>
    );
}
