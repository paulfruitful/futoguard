import Image from "next/image";

export function EmptyContactsState() {
  return (
    <div className="text-center py-12">
      {/* <div className="w-48 h-48 mx-auto mb-6 relative">
        <Image
          src="/placeholder.svg?height=192&width=192&text=Emergency+Contacts"
          alt="Emergency contacts illustration"
          width={192}
          height={192}
          className="w-full h-full object-contain opacity-50"
        />
      </div> */}
      <h3 className="text-lg font-semibold mb-2">Emergency Contact List</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Your emergency contacts will appear here once added. Add trusted
        contacts for quick access during emergencies.
      </p>
    </div>
  );
}
